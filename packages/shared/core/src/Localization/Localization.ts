import { DEFAULT_DATETIME_FORMAT, DEFAULT_TRANSLATIONS, EXCLUDE_PROPS, FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants/localization';
import { getCachedTranslations } from './translationCache';
import type { AddressableTranslationKey, CustomTranslations, Locale, TranslationKey, TranslationOptions, Translations } from '../translations';
import { getLocalisedAmount } from './amount/amount-util';
import restamper from '@integration-components/utils/datetime/restamper';
import type { RestamperWithTimezone } from '@integration-components/utils/datetime/restamper';
import { createTranslationsLoader, getLocalizationProxyDescriptors } from './localization-utils';
import { formatCustomTranslations, getTranslation, toTwoLetterCode, type ResolvableTranslationKey } from './utils';
import {
    ALREADY_RESOLVED_PROMISE,
    createWatchlist,
    hasOwnProperty,
    isNull,
    isNullish,
    isUndefined,
    noop,
    struct,
} from '@integration-components/utils';
import { httpGet } from '../Http/http';
import { SupportedLocales } from './types';
import { translationsDevAssets } from '../translations/local';

export type LocalizationSources = Readonly<{
    defaultTranslations: Record<string, string>;
    localeTranslations: Readonly<Record<string, Promise<Record<string, string>> | (() => Promise<Record<string, string>>)>>;
}>;

export type TranslationFamily = Readonly<{
    base: string | null;
    zero: string | null;
    one: string | null;
    plural: string | null;
    unsupportedExactCounts: number[];
}>;

// The catalogs are keyed by catalog keys at runtime; reading their keys widens to plain strings,
// so the family scan narrows them back to the addressable keyspace.
const catalogKeysOf = (source: object): AddressableTranslationKey[] => Object.keys(source) as AddressableTranslationKey[];

export default class Localization {
    #locale: Locale = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: Readonly<Locale[]> = [...SUPPORTED_LOCALES];

    #customTranslations?: CustomTranslations;

    // The active locale catalog, layered by `#resolveTemplate` instead of being spread into one
    // merged catalog: the custom translations of the active locale win, then this catalog, then
    // the en-US defaults. Before the first refresh resolves, only the defaults serve.
    #activeTranslations: Record<string, string> | null = null;
    #defaultTranslations: Record<string, string>;
    #translationFamilyExactCounts: Map<AddressableTranslationKey, readonly number[]> | null = null;
    #translationsLoader = createTranslationsLoader.call(this);
    readonly #fetchTranslationFromCdnPromise: (locale: SupportedLocales) => Promise<any>;

    #ready: Promise<void> = ALREADY_RESOLVED_PROMISE;
    #currentRefresh?: Promise<void>;
    #markRefreshAsDone?: () => void;
    #refreshWatchlist = createWatchlist({ timestamp: () => performance.now() });
    #restamp: RestamperWithTimezone = restamper();

    private watch = this.#refreshWatchlist.subscribe.bind(undefined);
    public i18n: Omit<Localization, (typeof EXCLUDE_PROPS)[number]> = struct(getLocalizationProxyDescriptors.call(this));

    constructor(locale: string = FALLBACK_LOCALE, cdnTranslationsUrl = '', sources?: LocalizationSources) {
        this.watch(noop);
        this.#defaultTranslations = sources?.defaultTranslations ?? (DEFAULT_TRANSLATIONS as Record<string, string>);

        const getBundledTranslations = (locale: string) => {
            const source = sources?.localeTranslations[locale];
            return Promise.resolve(typeof source === 'function' ? source() : (source ?? {}));
        };

        // Every CDN locale catalog is self-describing (key → copy), so a response from another
        // deployment is merely out of date rather than misaligned: keys it does not carry fall
        // through to the bundled defaults, and keys the SDK does not know are never read.
        const isLocaleCatalog = (value: any): value is Translations => value !== null && typeof value === 'object' && !Array.isArray(value);

        const loadCdnCatalog = (locale: string, fallback: () => Promise<Translations | null>): Promise<Translations | null> =>
            getCachedTranslations(`${cdnTranslationsUrl}/locales/${locale}.json`, () =>
                httpGet<any>({
                    loadingContext: cdnTranslationsUrl,
                    path: `/locales/${locale}.json`,
                    versionless: true,
                    skipContentType: true,
                    errorLevel: 'info',
                })
            )
                .then(translations => (isLocaleCatalog(translations) ? translations : fallback()))
                .catch(() => fallback());

        this.#fetchTranslationFromCdnPromise = (locale: string) => {
            if (!sources) {
                return process.env.VITE_LOCAL_ASSETS
                    ? Promise.resolve(translationsDevAssets[locale]!)
                    : loadCdnCatalog(locale, () => Promise.resolve(null));
            }

            if (locale === FALLBACK_LOCALE || process.env.VITE_LOCAL_ASSETS) {
                return getBundledTranslations(locale);
            }

            // The cache coalesces concurrent requests for the same catalog and serves the cached
            // response within its time-to-live; an unusable CDN response falls back to the bundled catalog.
            return loadCdnCatalog(locale, () => getBundledTranslations(locale));
        };

        this.locale = locale;
    }

    get customTranslations(): CustomTranslations {
        return this.#customTranslations ?? ({} as CustomTranslations);
    }

    set customTranslations(customTranslations: CustomTranslations | undefined | null) {
        let translations: CustomTranslations | undefined = undefined;
        let supportedLocales: Locale[] = [...SUPPORTED_LOCALES];

        if (!isNullish(customTranslations)) {
            translations = formatCustomTranslations(customTranslations, SUPPORTED_LOCALES);
            const localesFromCustomTranslations = Object.keys(translations) as Locale[];

            // default locales + validated custom locales
            supportedLocales = [...supportedLocales, ...localesFromCustomTranslations]
                .sort()
                .filter((locale, index, locales) => locales.indexOf(locale) === index);
        }

        this.#translationsLoader.supportedLocales = supportedLocales;
        this.#refreshTranslations(translations);
    }

    get languageCode() {
        return this.#languageCode;
    }

    get lastRefreshTimestamp() {
        return this.#refreshWatchlist.snapshot.timestamp;
    }

    get locale(): Locale {
        return this.#locale;
    }

    set locale(locale: string | undefined | null) {
        if (!isNullish(locale)) {
            this.#translationsLoader.locale = locale;
            if (this.#locale === this.#translationsLoader.locale) return;
            this.#refreshTranslations(this.#customTranslations);
        } else {
            this.locale = FALLBACK_LOCALE;
        }
    }

    get ready(): Promise<void> {
        return this.#ready;
    }

    get supportedLocales(): Readonly<Locale[]> {
        return this.#supportedLocales;
    }

    get timezone(): RestamperWithTimezone['tz']['current'] {
        return this.#restamp.tz.current;
    }

    set timezone(timezone: string | undefined | null) {
        this.#restamp.tz = timezone;
    }

    #refreshTranslations(customTranslations?: CustomTranslations) {
        if (isUndefined(this.#markRefreshAsDone)) {
            this.#ready = new Promise<void>(resolve => {
                this.#markRefreshAsDone = () => {
                    resolve(this.#currentRefresh);
                    this.#currentRefresh = this.#markRefreshAsDone = undefined;
                };
            });
        }

        const currentRefreshDone = () => {
            if (this.#currentRefresh === currentRefresh) {
                this.#markRefreshAsDone?.();
            }
        };

        const currentRefresh = (this.#currentRefresh = (async () => {
            this.#activeTranslations = (await this.#translationsLoader.load(this.#fetchTranslationFromCdnPromise)) ?? null;
            this.#translationFamilyExactCounts = null;
            this.#locale = this.#translationsLoader.locale;
            this.#supportedLocales = Object.freeze(this.#translationsLoader.supportedLocales);
            this.#customTranslations = customTranslations;
            this.#languageCode = toTwoLetterCode(this.#locale);
            this.#refreshWatchlist.requestNotification();
        })());

        currentRefresh.then(currentRefreshDone).catch(reason => {
            currentRefreshDone();
            // handle current refresh promise rejection
            // throw reason;
            console.error(reason);
        });
    }

    // Exact counts above one are only meaningful to the Bento bridge, which is the sole caller of
    // getTranslationFamily. Building the map on first query instead of on every refresh keeps the
    // full-catalog scan off the refresh path for components that never ask for a family.
    #getTranslationFamilyExactCounts(): Map<AddressableTranslationKey, readonly number[]> {
        const exactCounts = new Map<AddressableTranslationKey, number[]>();

        // The scan covers every key the merged catalog of the previous design exposed: the en-US
        // defaults, the active locale catalog, and the custom translations of the active locale.
        const translationKeys = new Set<AddressableTranslationKey>(catalogKeysOf(this.#defaultTranslations));

        if (this.#activeTranslations !== null) {
            for (const translationKey of catalogKeysOf(this.#activeTranslations)) translationKeys.add(translationKey);
        }

        const customLocaleTranslations = this.#customTranslations?.[this.#locale];
        if (customLocaleTranslations !== undefined) {
            for (const translationKey of catalogKeysOf(customLocaleTranslations)) translationKeys.add(translationKey);
        }

        for (const translationKey of translationKeys) {
            const separatorIndex = translationKey.lastIndexOf('__');
            if (separatorIndex < 0) continue;

            const count = Number(translationKey.slice(separatorIndex + 2));
            if (!Number.isInteger(count) || count <= 1) continue;

            // The family base of a catalog key; the runtime map is keyed like the catalog.
            const key = translationKey.slice(0, separatorIndex) as AddressableTranslationKey;
            const counts = exactCounts.get(key);

            if (counts) {
                counts.push(count);
            } else {
                exactCounts.set(key, [count]);
            }
        }

        return exactCounts;
    }

    // Layers the active sources for a key without materializing a merged catalog. A key that exists
    // with an empty string is authoritative and does not fall through, matching the spread-merge
    // of the previous design.
    readonly #resolveTemplate = (key: ResolvableTranslationKey): string | null => {
        const customLocaleTranslations = this.#customTranslations?.[this.#locale] as Record<string, string> | undefined;
        if (customLocaleTranslations !== undefined && hasOwnProperty(customLocaleTranslations, key)) {
            return customLocaleTranslations[key] ?? null;
        }

        if (this.#activeTranslations !== null && hasOwnProperty(this.#activeTranslations, key)) {
            return this.#activeTranslations[key] ?? null;
        }

        return this.#defaultTranslations[key] ?? null;
    };

    /**
     * Returns a translated string from a key in the current {@link Localization.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */
    get(key: TranslationKey, options?: TranslationOptions): string {
        const translation = getTranslation(this.#resolveTemplate, key, options);
        return isNull(translation) ? key : translation;
    }

    /**
     * Returns the untranslated template for a key in the current locale.
     * This is intended for consumers that need to compile the SDK placeholder
     * syntax for another localization runtime.
     */
    getTemplate(key: AddressableTranslationKey): string | null {
        return this.#resolveTemplate(key);
    }

    /**
     * Returns the raw count-based templates for a key in the current locale.
     * Bento can represent the zero, one, and greater-than-one forms, but not
     * arbitrary exact counts above one.
     */
    getTranslationFamily(key: AddressableTranslationKey): TranslationFamily {
        this.#translationFamilyExactCounts ??= this.#getTranslationFamilyExactCounts();

        return {
            base: this.#resolveTemplate(key),
            zero: this.#resolveTemplate(`${key}__0`),
            one: this.#resolveTemplate(`${key}__1`),
            plural: this.#resolveTemplate(`${key}__plural`),
            unsupportedExactCounts: [...(this.#translationFamilyExactCounts.get(key) ?? [])],
        };
    }

    /**
     * Returns a boolean that checks if the translation key exists in the current {@link Localization.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns boolean
     */
    has(key: AddressableTranslationKey, options?: TranslationOptions): key is TranslationKey {
        const translation = getTranslation(this.#resolveTemplate, key, options);
        return !!translation;
    }

    /**
     * Returns a localized string for an amount
     * @param amount - Amount to be converted
     * @param currencyCode - Currency code of the amount
     * @param options - Options for String.prototype.toLocaleString
     */
    amount(amount: number, currencyCode: string, options?: Record<string, any>): string {
        const { hideCurrency, ...restOfOptions } = options || {};
        const localisedAmount = getLocalisedAmount(amount, this.#locale, currencyCode, hideCurrency, {
            ...restOfOptions,
            currencyDisplay: 'symbol',
            signDisplay: 'never',
        });

        return amount < 0 ? `- ${localisedAmount}` : localisedAmount;
    }

    /**
     * Returns a localized string for a date
     * @param date - Date to be localized
     * @param options - Options for {@link Date.toLocaleDateString}
     */
    date(date: number | string | Date, options: Intl.DateTimeFormatOptions = {}) {
        const dateOptions = { ...DEFAULT_DATETIME_FORMAT, timeZone: this.#restamp.tz.current, ...options };
        return new Date(date).toLocaleDateString(this.#locale, dateOptions);
    }

    /**
     * Returns a localized string for a full date
     * @param date - Date to be localized
     */
    fullDate(date: number | string | Date) {
        return this.date(date, {
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }
}
