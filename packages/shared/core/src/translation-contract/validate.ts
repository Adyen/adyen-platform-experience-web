import { compileTranslationTemplate, parseV1TranslationTemplate } from './message';
import {
    translationTargetId,
    type DomainTranslationSources,
    type TranslationContractRegistry,
    type TranslationDiagnostic,
    type TranslationSource,
} from './types';

export type TranslationContractValidationInput = Readonly<{
    bentoKeys: ReadonlySet<string>;
    domainSources: DomainTranslationSources;
    publicTemplates: TranslationSource;
    registry: TranslationContractRegistry;
    sdkBentoFallbacks?: TranslationSource;
}>;

const isPublicKey = (key: string, domains: ReadonlySet<string>): boolean => {
    if (key.startsWith('bento.') || key.startsWith('common.bento.')) return false;
    if (key.startsWith('common.')) return key.length > 'common.'.length;

    const separatorIndex = key.indexOf('.');
    return separatorIndex > 0 && domains.has(key.slice(0, separatorIndex));
};

const hasPlaceholders = (template: string, placeholders: readonly string[]): boolean => {
    const actual = parseV1TranslationTemplate(template).placeholders;
    return actual.length === placeholders.length && actual.every((placeholder, index) => placeholder === placeholders[index]);
};

export const validateTranslationContract = ({
    bentoKeys,
    domainSources,
    publicTemplates,
    registry,
    sdkBentoFallbacks,
}: TranslationContractValidationInput): readonly TranslationDiagnostic[] => {
    const diagnostics: TranslationDiagnostic[] = [];
    const domains = new Set(registry.domains);
    const publicKeys = new Set<string>();
    const targetRoutes = new Map<string, string>();

    for (const route of registry.routes) {
        if (!isPublicKey(route.publicKey, domains)) {
            diagnostics.push({ code: 'invalid_translation_key', publicKey: route.publicKey });
        }

        if (publicKeys.has(route.publicKey)) {
            diagnostics.push({ code: 'duplicate_translation_route', publicKey: route.publicKey });
        }
        publicKeys.add(route.publicKey);

        if (!route.targets.length) {
            diagnostics.push({ code: 'stale_translation_route', publicKey: route.publicKey });
        }

        const publicTemplate = publicTemplates[route.publicKey];
        const domainTemplate = route.targets
            .filter((target): target is Extract<(typeof route.targets)[number], { kind: 'domain' }> => target.kind === 'domain')
            .map(target => domainSources[target.domain]?.[target.key])
            .find((template): template is string => template !== undefined);
        let placeholders = route.placeholders;

        if (publicTemplate !== undefined) {
            try {
                placeholders = parseV1TranslationTemplate(publicTemplate).placeholders;
            } catch {
                diagnostics.push({ code: 'invalid_translation_template', publicKey: route.publicKey });
            }
        } else if (domainTemplate !== undefined) {
            try {
                placeholders = parseV1TranslationTemplate(domainTemplate).placeholders;
            } catch {
                diagnostics.push({ code: 'invalid_translation_template', publicKey: route.publicKey });
            }
        } else if (placeholders === undefined) {
            diagnostics.push({ code: 'invalid_translation_template', publicKey: route.publicKey });
        }

        for (const target of route.targets) {
            const id = translationTargetId(target);
            if (targetRoutes.has(id)) {
                diagnostics.push({
                    code: 'duplicate_translation_route',
                    publicKey: route.publicKey,
                    targetKey: target.key,
                    ...(target.kind === 'domain' && { domain: target.domain }),
                });
            } else {
                targetRoutes.set(id, route.publicKey);
            }

            if (target.kind === 'bento') {
                if (!route.publicKey.startsWith('common.')) {
                    diagnostics.push({ code: 'invalid_translation_key', publicKey: route.publicKey, targetKey: target.key });
                }
                if (!bentoKeys.has(target.key)) {
                    diagnostics.push({ code: 'unsupported_translation_target', publicKey: route.publicKey, targetKey: target.key });
                }
            } else {
                const source = domainSources[target.domain];
                const localTemplate = source?.[target.key];

                if (!domains.has(target.domain) || !source || localTemplate === undefined) {
                    diagnostics.push({
                        code: 'stale_translation_route',
                        domain: target.domain,
                        publicKey: route.publicKey,
                        targetKey: target.key,
                    });
                } else if (placeholders !== undefined) {
                    try {
                        if (!hasPlaceholders(localTemplate, placeholders)) {
                            diagnostics.push({
                                code: 'invalid_translation_template',
                                domain: target.domain,
                                publicKey: route.publicKey,
                                targetKey: target.key,
                            });
                        }
                    } catch {
                        diagnostics.push({
                            code: 'invalid_translation_template',
                            domain: target.domain,
                            publicKey: route.publicKey,
                            targetKey: target.key,
                        });
                    }
                }
            }

            if (publicTemplate !== undefined) {
                try {
                    compileTranslationTemplate(parseV1TranslationTemplate(publicTemplate), target.format);
                } catch {
                    diagnostics.push({
                        code: 'invalid_translation_template',
                        publicKey: route.publicKey,
                        targetKey: target.key,
                        ...(target.kind === 'domain' && { domain: target.domain }),
                    });
                }
            }
        }
    }

    for (const [domain, source] of Object.entries(domainSources)) {
        for (const key of Object.keys(source)) {
            if (!targetRoutes.has(`domain:${domain}:${key}`)) {
                diagnostics.push({ code: 'missing_translation_route', domain, targetKey: key });
            }
        }
    }

    for (const [key, template] of Object.entries(sdkBentoFallbacks ?? {})) {
        if (!key.startsWith('bento.') || !bentoKeys.has(key)) {
            diagnostics.push({ code: 'invalid_bento_fallback', targetKey: key });
            continue;
        }
        try {
            compileTranslationTemplate(parseV1TranslationTemplate(template), 'bento');
        } catch {
            diagnostics.push({ code: 'invalid_bento_fallback', targetKey: key });
        }
    }

    const aliases = new Set<string>();
    for (const alias of registry.aliases) {
        if (!isPublicKey(alias.alias, domains) || publicKeys.has(alias.alias) || !alias.targets.length) {
            diagnostics.push({ code: 'invalid_translation_alias' });
        }
        if (aliases.has(alias.alias)) {
            diagnostics.push({ code: 'duplicate_translation_alias' });
        }
        aliases.add(alias.alias);

        if (alias.targets.some(target => !publicKeys.has(target))) {
            diagnostics.push({ code: 'invalid_translation_alias' });
        }
    }

    return diagnostics;
};

export const assertValidTranslationContract = (input: TranslationContractValidationInput): void => {
    const diagnostics = validateTranslationContract(input);
    if (!diagnostics.length) return;

    const summary = diagnostics
        .map(({ code, domain, publicKey, targetKey }) => [code, domain, publicKey, targetKey].filter(Boolean).join(':'))
        .join('\n');
    throw new Error(`Invalid V2 translation contract:\n${summary}`);
};
