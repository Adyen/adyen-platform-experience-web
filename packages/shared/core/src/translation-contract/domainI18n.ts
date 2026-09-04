import { canonicalizeTranslationLocale } from './locale';
import { formatV1TranslationTemplate, parseV1TranslationTemplate } from './template';
import type { DomainTranslationInputs, TranslationOptions, TranslationSource, TranslationTemplate } from './types';

export type DomainCustomTranslations = Record<string, TranslationSource>;

export interface DomainI18nFormatters {
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    readonly ready?: Promise<void>;
    timezone?: string;
}

export interface DomainI18n<DomainKey extends string = string> {
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    get(key: string, options?: TranslationOptions): string;
    has(key: string, options?: TranslationOptions): key is DomainKey;
    readonly customTranslations: DomainCustomTranslations;
    readonly languageCode: string;
    readonly lastRefreshTimestamp: number;
    readonly locale: string;
    readonly ready: Promise<void>;
    resolveTemplate(key: string, options?: TranslationOptions): string | undefined;
    resolveLocalTemplate(key: string, options?: TranslationOptions): string | undefined;
    readonly supportedLocales: readonly string[];
    timezone?: string;
    update(inputs: DomainTranslationInputs<DomainKey>): boolean;
}

export type DomainI18nOptions<DomainKey extends string> = Readonly<{
    defaultLocale?: string;
    formatters?: DomainI18nFormatters;
    inputs?: DomainTranslationInputs<DomainKey>;
    localSources?: Readonly<Record<string, TranslationSource>>;
    protectedKeys?: ReadonlySet<DomainKey | string>;
    source: TranslationSource;
}>;

const selectKey = (source: TranslationSource, key: string, options?: TranslationOptions): string => {
    const count = options?.count ?? 0;
    const exactKey = `${key}__${count}`;
    if (source[exactKey] !== undefined) return exactKey;

    const pluralKey = `${key}__plural`;
    if (count > 1 && source[pluralKey] !== undefined) return pluralKey;

    return key;
};

export class DomainLocalization<DomainKey extends string> implements DomainI18n<DomainKey> {
    readonly #defaultLocale: string;
    readonly #formatters?: DomainI18nFormatters;
    readonly #localSources: Readonly<Record<string, TranslationSource>>;
    readonly #protectedKeys: ReadonlySet<string>;
    readonly #source: TranslationSource;
    readonly #templateCache = new Map<string, TranslationTemplate>();

    #inputs: DomainTranslationInputs<DomainKey>;
    #lastRefreshTimestamp = 0;
    #locale: string;

    constructor(options: DomainI18nOptions<DomainKey>) {
        this.#defaultLocale = canonicalizeTranslationLocale(options.defaultLocale) ?? 'en-US';
        this.#formatters = options.formatters;
        this.#inputs = options.inputs ?? {};
        this.#locale = canonicalizeTranslationLocale(this.#inputs.locale) ?? this.#defaultLocale;
        this.#localSources = options.localSources ?? {};
        this.#protectedKeys = options.protectedKeys ?? new Set();
        this.#source = options.source;
    }

    get locale(): string {
        return this.#locale;
    }

    get customTranslations(): DomainCustomTranslations {
        return {};
    }

    get languageCode(): string {
        return this.locale.slice(0, 2).toLowerCase();
    }

    get lastRefreshTimestamp(): number {
        return this.#lastRefreshTimestamp;
    }

    get ready(): Promise<void> {
        return this.#formatters?.ready ?? Promise.resolve();
    }

    get timezone(): string | undefined {
        return this.#formatters?.timezone;
    }

    get supportedLocales(): readonly string[] {
        return this.locale === 'en-US' ? ['en-US'] : ['en-US', this.locale];
    }

    set timezone(timezone: string | undefined) {
        if (this.#formatters) this.#formatters.timezone = timezone;
    }

    update(inputs: DomainTranslationInputs<DomainKey>): boolean {
        const nextLocale = canonicalizeTranslationLocale(inputs.locale) ?? this.#defaultLocale;
        const changed = nextLocale !== this.#locale || inputs.getCustomTranslations !== this.#inputs.getCustomTranslations;
        this.#inputs = inputs;
        this.#locale = nextLocale;
        if (changed) {
            this.#lastRefreshTimestamp = Date.now();
            this.#templateCache.clear();
        }
        return changed;
    }

    get(key: string, options?: TranslationOptions): string {
        const template = this.resolveTemplate(key, options);
        if (template === undefined) return key;
        let parsed = this.#templateCache.get(template);
        if (!parsed) {
            parsed = parseV1TranslationTemplate(template);
            this.#templateCache.set(template, parsed);
        }
        return formatV1TranslationTemplate(parsed, options?.values);
    }

    has(key: string, options?: TranslationOptions): key is DomainKey {
        return this.resolveTemplate(key, options) !== undefined;
    }

    resolveTemplate(key: string, options?: TranslationOptions): string | undefined {
        const selectedKey = selectKey(this.#source, key, options);
        const localLocaleTemplate = this.#localSources[this.locale]?.[selectedKey];
        const localDefaultTemplate = this.#source[selectedKey];

        if (this.#protectedKeys.has(selectedKey)) {
            return localLocaleTemplate ?? localDefaultTemplate;
        }

        const candidates = this.#inputs.getCustomTranslations?.(selectedKey as DomainKey, this.locale);
        if (selectedKey.startsWith('bento.')) {
            // Routed Bento keys resolve from the SDK contract. A domain-local value is honoured
            // only when the domain protects the key.
            return candidates?.localeTranslation ?? candidates?.defaultTranslation ?? localLocaleTemplate ?? localDefaultTemplate;
        }
        return candidates?.localeTranslation ?? localLocaleTemplate ?? candidates?.defaultTranslation ?? localDefaultTemplate;
    }

    resolveLocalTemplate(key: string, options?: TranslationOptions): string | undefined {
        const selectedKey = selectKey(this.#source, key, options);
        return this.#localSources[this.locale]?.[selectedKey] ?? this.#source[selectedKey];
    }

    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string {
        return (
            this.#formatters?.amount(amount, currencyCode, options) ??
            new Intl.NumberFormat(this.locale, { currency: currencyCode, style: 'currency' }).format(amount / 100)
        );
    }

    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string {
        return this.#formatters?.date(date, options) ?? new Date(date).toLocaleDateString(this.locale, options);
    }

    fullDate(date: number | string | Date): string {
        return this.#formatters?.fullDate(date) ?? new Date(date).toLocaleString(this.locale);
    }
}

export const createDomainI18n = <DomainKey extends string>(options: DomainI18nOptions<DomainKey>): DomainI18n<DomainKey> =>
    new DomainLocalization(options);
