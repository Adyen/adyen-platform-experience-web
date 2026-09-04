import { V2_PUBLIC_TRANSLATION_PLACEHOLDER_CONTRACTS, V2_TRANSLATION_ALIASES, V2_TRANSLATION_ROUTES } from './generated';
import { TranslationDiagnostics, type TranslationDiagnosticReporter } from './diagnostics';
import { canonicalizeTranslationLocale } from './locale';
import { compileTranslationTemplate, haveMatchingPlaceholders, parseV1TranslationTemplate } from './message';
import { translationTargetId } from './types';
import type {
    ConsumerTranslations,
    CustomTranslationCandidates,
    GetCustomTranslations,
    PublicTranslationAlias,
    PublicTranslationRoute,
    TranslationResolverSources,
    TranslationSource,
    TranslationTarget,
    TranslationPlaceholderContracts,
} from './types';

type CandidateSources = Readonly<{
    alias?: string;
    direct?: string;
}>;

type ValidConsumerTranslations = Readonly<Record<string, Readonly<Record<string, CandidateSources>>>>;

export class TranslationContractResolver {
    readonly #aliases = new Map<string, PublicTranslationAlias>();
    readonly #callbacks = new Map<string, GetCustomTranslations<string>>();
    readonly #compiledTemplates = new Map<string, string>();
    readonly #diagnostics: TranslationDiagnostics;
    readonly #placeholderContracts: TranslationPlaceholderContracts;
    readonly #routesByPublicKey = new Map<string, PublicTranslationRoute>();
    readonly #routesByTarget = new Map<string, { format: TranslationTarget['format']; publicKey: string }>();

    #consumerTranslations: ValidConsumerTranslations = {};
    #sdkBentoDefaultTranslations: TranslationSource = {};
    #sdkBentoLocaleTranslations: TranslationSource = {};
    #sdkDefaultTranslations: TranslationSource = {};
    #sdkLocale?: string;
    #sdkLocaleTranslations: TranslationSource = {};
    #sourceState?: TranslationResolverSources;

    constructor(options: {
        diagnosticReporter?: TranslationDiagnosticReporter;
        routes?: readonly PublicTranslationRoute[];
        aliases?: readonly PublicTranslationAlias[];
        placeholderContracts?: TranslationPlaceholderContracts;
        sources: TranslationResolverSources;
    }) {
        this.#diagnostics = new TranslationDiagnostics(options.diagnosticReporter);
        this.#placeholderContracts =
            options.placeholderContracts ?? (options.routes ? {} : (V2_PUBLIC_TRANSLATION_PLACEHOLDER_CONTRACTS as TranslationPlaceholderContracts));

        for (const route of options.routes ?? (V2_TRANSLATION_ROUTES as readonly PublicTranslationRoute[])) {
            this.#routesByPublicKey.set(route.publicKey, route);
            for (const target of route.targets) {
                this.#routesByTarget.set(translationTargetId(target), { format: target.format, publicKey: route.publicKey });
            }
        }

        for (const alias of options.aliases ?? (V2_TRANSLATION_ALIASES as readonly PublicTranslationAlias[])) {
            this.#aliases.set(alias.alias, alias);
        }

        this.update(options.sources);
    }

    update(sources: TranslationResolverSources): boolean {
        const sdkLocale = canonicalizeTranslationLocale(sources.sdkLocale);
        const currentSources = this.#sourceState;
        if (
            currentSources &&
            currentSources.consumerTranslations === sources.consumerTranslations &&
            currentSources.sdkBentoDefaultTranslations === sources.sdkBentoDefaultTranslations &&
            currentSources.sdkBentoLocaleTranslations === sources.sdkBentoLocaleTranslations &&
            currentSources.sdkDefaultTranslations === sources.sdkDefaultTranslations &&
            this.#sdkLocale === sdkLocale &&
            currentSources.sdkLocaleTranslations === sources.sdkLocaleTranslations
        ) {
            return false;
        }

        this.#sourceState = sources;
        this.#sdkBentoDefaultTranslations = sources.sdkBentoDefaultTranslations ?? {};
        this.#sdkBentoLocaleTranslations = sources.sdkBentoLocaleTranslations ?? {};
        this.#sdkDefaultTranslations = sources.sdkDefaultTranslations;
        this.#sdkLocale = sdkLocale;
        this.#sdkLocaleTranslations = sources.sdkLocaleTranslations ?? {};
        this.#consumerTranslations = this.#validateConsumerTranslations(sources.consumerTranslations);
        this.#callbacks.clear();
        this.#compiledTemplates.clear();
        return true;
    }

    getCallback<DomainKey extends string>(domain: string): GetCustomTranslations<DomainKey> {
        const current = this.#callbacks.get(domain);
        if (current) return current as GetCustomTranslations<DomainKey>;

        const callback: GetCustomTranslations<string> = (key, locale) => this.#getCandidates(domain, key, locale);
        this.#callbacks.set(domain, callback);
        return callback as GetCustomTranslations<DomainKey>;
    }

    #getCandidates(domain: string, key: string, locale: string): CustomTranslationCandidates {
        const isBentoKey = key.startsWith('bento.');
        const route = isBentoKey ? this.#routesByTarget.get(`bento:${key}`) : this.#routesByTarget.get(`domain:${domain}:${key}`);

        if (!route) {
            if (isBentoKey) return this.#getBentoFallbackCandidates(key, locale);
            const extensionCandidates = this.#getExtensionCandidates(key, locale);
            if (extensionCandidates) return extensionCandidates;
            this.#diagnostics.report({ code: 'unmapped_domain_key', domain });
            return {};
        }

        const canonicalLocale = canonicalizeTranslationLocale(locale);
        if (!canonicalLocale) {
            this.#diagnostics.report({ code: 'invalid_translation_locale', domain, publicKey: route.publicKey });
            return {};
        }

        const defaultTemplate = this.#resolvePublicTemplate(route.publicKey, 'en-US');
        const localeTemplate = canonicalLocale === 'en-US' ? defaultTemplate : this.#resolvePublicTemplate(route.publicKey, canonicalLocale);

        if (defaultTemplate === undefined && localeTemplate === undefined && isBentoKey) {
            // A routed key whose public copy is absent falls back to the SDK-owned Bento copy.
            return this.#getBentoFallbackCandidates(key, canonicalLocale);
        }

        return {
            ...(defaultTemplate !== undefined && {
                defaultTranslation: this.#compileTemplate(route.publicKey, defaultTemplate, route.format),
            }),
            ...(localeTemplate !== undefined && {
                localeTranslation: this.#compileTemplate(route.publicKey, localeTemplate, route.format),
            }),
        };
    }

    /**
     * SDK-owned Bento fallback candidates, used when a Bento key has no public route or the
     * public-route candidates are absent. Consumer custom translations on the public key are
     * resolved first through the route and always win over this fallback.
     */
    #getBentoFallbackCandidates(key: string, locale: string): CustomTranslationCandidates {
        const canonicalLocale = canonicalizeTranslationLocale(locale);
        if (!canonicalLocale) return {};

        const defaultTemplate = this.#sdkBentoDefaultTranslations[key];
        const localeTemplate =
            canonicalLocale === 'en-US' ? defaultTemplate : canonicalLocale === this.#sdkLocale ? this.#sdkBentoLocaleTranslations[key] : undefined;

        return {
            ...(defaultTemplate !== undefined && {
                defaultTranslation: this.#compileTemplate(key, defaultTemplate, 'bento'),
            }),
            ...(localeTemplate !== undefined && {
                localeTranslation: this.#compileTemplate(key, localeTemplate, 'bento'),
            }),
        };
    }

    /**
     * Consumer extension values (for example, data-customization field labels) are addressed
     * by their own key rather than a public catalog route. They resolve from consumer values
     * only: the SDK holds no default or locale-file copy for an extension key.
     */
    #getExtensionCandidates(key: string, locale: string): CustomTranslationCandidates | undefined {
        const canonicalLocale = canonicalizeTranslationLocale(locale);
        if (!canonicalLocale) return undefined;

        const defaultCandidates = this.#consumerTranslations['en-US']?.[key];
        const localeCandidates = canonicalLocale === 'en-US' ? defaultCandidates : this.#consumerTranslations[canonicalLocale]?.[key];
        const defaultTemplate = defaultCandidates?.direct !== undefined ? this.#compileTemplate(key, defaultCandidates.direct, 'v1') : undefined;
        const localeTemplate = localeCandidates?.direct !== undefined ? this.#compileTemplate(key, localeCandidates.direct, 'v1') : undefined;

        if (defaultTemplate === undefined && localeTemplate === undefined) return undefined;

        return {
            ...(defaultTemplate !== undefined && { defaultTranslation: defaultTemplate }),
            ...(localeTemplate !== undefined && { localeTranslation: localeTemplate }),
        };
    }

    #compileTemplate(publicKey: string, template: string, format: TranslationTarget['format']): string {
        const cacheKey = JSON.stringify([publicKey, template, format]);
        const cached = this.#compiledTemplates.get(cacheKey);
        if (cached !== undefined) return cached;

        const compiled = compileTranslationTemplate(parseV1TranslationTemplate(template), format);
        this.#compiledTemplates.set(cacheKey, compiled);
        return compiled;
    }

    #resolvePublicTemplate(publicKey: string, locale: string): string | undefined {
        const candidates = this.#consumerTranslations[locale]?.[publicKey];
        if (candidates?.direct !== undefined) return candidates.direct;
        if (candidates?.alias !== undefined) return candidates.alias;

        if (locale === 'en-US') return this.#sdkDefaultTranslations[publicKey];
        if (locale === this.#sdkLocale) return this.#sdkLocaleTranslations[publicKey];
        return undefined;
    }

    #validateConsumerTranslations(translations: ConsumerTranslations | undefined): ValidConsumerTranslations {
        if (!translations) {
            return {};
        }

        const valid: Record<string, Record<string, CandidateSources>> = {};

        for (const [inputLocale, values] of Object.entries(translations)) {
            const locale = canonicalizeTranslationLocale(inputLocale);
            if (!locale) {
                this.#diagnostics.report({ code: 'invalid_translation_locale' });
                continue;
            }

            const localeValues = (valid[locale] ??= {});
            for (const [inputKey, template] of Object.entries(values)) {
                const directRoute = this.#routesByPublicKey.get(inputKey);
                const alias = this.#aliases.get(inputKey);

                if (!directRoute && !alias) {
                    if (this.#isBentoShapedKey(inputKey)) {
                        this.#diagnostics.report({ code: 'unknown_translation_key' });
                        continue;
                    }

                    // A consumer key outside the public catalog is an extension value (for
                    // example, a data-customization field label). It stays addressable under
                    // its own key instead of being rejected as unknown.
                    if (!this.#isValidExtensionTemplate(template)) continue;
                    localeValues[inputKey] = { direct: template };
                    continue;
                }

                const publicKeys = directRoute ? [directRoute.publicKey] : alias!.targets;
                for (const publicKey of publicKeys) {
                    const route = this.#routesByPublicKey.get(publicKey);
                    if (!route || !this.#isValidTemplate(publicKey, template, route)) continue;

                    const current = (localeValues[publicKey] ??= {});
                    if (directRoute) {
                        localeValues[publicKey] = { ...current, direct: template };
                    } else if (current.alias === undefined) {
                        localeValues[publicKey] = { ...current, alias: template };
                    }
                }

                if (alias?.deprecated) {
                    this.#diagnostics.report({ code: 'deprecated_translation_key' });
                }
            }
        }

        return valid;
    }

    /** Bento-shaped keys (`bento.*`, `common.bento.*`, `{domain}.bento.*`) are never valid consumer keys. */
    #isBentoShapedKey(key: string): boolean {
        return key.startsWith('bento.') || key.includes('.bento.');
    }

    /** Extension values carry no placeholder contract, so only public V1 parseability is enforced. */
    #isValidExtensionTemplate(template: string): boolean {
        try {
            compileTranslationTemplate(parseV1TranslationTemplate(template), 'v1');
            return true;
        } catch {
            this.#diagnostics.report({ code: 'invalid_translation_template' });
            return false;
        }
    }

    #isValidTemplate(publicKey: string, template: string, route: PublicTranslationRoute): boolean {
        try {
            const publicDefault = this.#sdkDefaultTranslations[publicKey];
            if (publicDefault !== undefined && !haveMatchingPlaceholders(publicDefault, template)) {
                this.#diagnostics.report({ code: 'invalid_translation_template', publicKey });
                return false;
            }

            const parsed = parseV1TranslationTemplate(template);
            const placeholders = this.#placeholderContracts[publicKey] ?? route.placeholders;
            if (
                publicDefault === undefined &&
                placeholders !== undefined &&
                (parsed.placeholders.length !== placeholders.length ||
                    parsed.placeholders.some((placeholder, index) => placeholder !== placeholders[index]))
            ) {
                this.#diagnostics.report({ code: 'invalid_translation_template', publicKey });
                return false;
            }

            for (const target of route.targets) {
                compileTranslationTemplate(parsed, target.format);
            }
            return true;
        } catch {
            this.#diagnostics.report({ code: 'invalid_translation_template', publicKey });
            return false;
        }
    }
}
