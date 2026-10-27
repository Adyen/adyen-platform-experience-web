import { DEFAULT_DATETIME_FORMAT, DEFAULT_TRANSLATIONS, EXCLUDE_PROPS, FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants/localization';
import { getCachedTranslations } from './translationCache';
import type { CustomTranslations, Locale, TranslationKey, TranslationOptions } from '../translations';
import { getLocalisedAmount } from './amount/amount-util';
import restamper from '@integration-components/utils/datetime/restamper';
import type { RestamperWithTimezone } from '@integration-components/utils/datetime/restamper';
import { createTranslationsLoader, getLocalizationProxyDescriptors } from './localization-utils';
import { formatCustomTranslations, getTranslation, toTwoLetterCode } from './utils';
import { ALREADY_RESOLVED_PROMISE, createWatchlist, isNull, isNullish, isUndefined, noop, struct } from '@integration-components/utils';
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

export default class Localization {
    #locale: Locale = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: Readonly<Locale[]> = [...SUPPORTED_LOCALES];

    #customTranslations?: CustomTranslations;
    #translations: Record<string, string> = DEFAULT_TRANSLATIONS as Record<string, string>;
    #defaultTranslations: Record<string, string>;
    #translationFamilyExactCounts = new Map<string, readonly number[]>();
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
        this.#translations = this.#defaultTranslations;
        this.#translationFamilyExactCounts = this.#getTranslationFamilyExactCounts(this.#translations);

        const getBundledTranslations = (locale: string) => {
            const source = sources?.localeTranslations[locale];
            return Promise.resolve(typeof source === 'function' ? source() : (source ?? {}));
        };

        this.#fetchTranslationFromCdnPromise = (locale: string) => {
            const url = `${cdnTranslationsUrl}/${locale}.json`;

            const fetchTranslationsFromCdn = () =>
                httpGet<any>({
                    loadingContext: cdnTranslationsUrl,
                    path: `/${locale}.json`,
                    versionless: true,
                    skipContentType: true,
                    errorLevel: 'info',
                });

            if (!sources) {
                return process.env.VITE_LOCAL_ASSETS
                    ? Promise.resolve(translationsDevAssets[locale]!)
                    : getCachedTranslations(url, fetchTranslationsFromCdn);
            }

            if (locale === FALLBACK_LOCALE || process.env.VITE_LOCAL_ASSETS) {
                return getBundledTranslations(locale);
            }

            // The cache coalesces concurrent requests for the same catalog and serves the cached
            // response within its time-to-live; an empty or rejected CDN response falls back to the bundled catalog.
            return getCachedTranslations(url, fetchTranslationsFromCdn)
                .then(translations => translations ?? getBundledTranslations(locale))
                .catch(() => getBundledTranslations(locale));
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
            this.#translations = await this.#translationsLoader.load(
                this.#fetchTranslationFromCdnPromise,
                customTranslations,
                this.#defaultTranslations
            );
            this.#translationFamilyExactCounts = this.#getTranslationFamilyExactCounts(this.#translations);
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

    #getTranslationFamilyExactCounts(translations: Record<string, string>): Map<string, readonly number[]> {
        const exactCounts = new Map<string, number[]>();

        for (const translationKey of Object.keys(translations)) {
            const separatorIndex = translationKey.lastIndexOf('__');
            if (separatorIndex < 0) continue;

            const count = Number(translationKey.slice(separatorIndex + 2));
            if (!Number.isInteger(count) || count <= 1) continue;

            const key = translationKey.slice(0, separatorIndex);
            const counts = exactCounts.get(key);

            if (counts) {
                counts.push(count);
            } else {
                exactCounts.set(key, [count]);
            }
        }

        return exactCounts;
    }

    /**
     * Returns a translated string from a key in the current {@link Localization.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */
    get(key: TranslationKey, options?: TranslationOptions): string {
        const translation = getTranslation(this.#translations, key, options);
        return isNull(translation) ? key : translation;
    }

    /**
     * Returns the untranslated template for a key in the current locale.
     * This is intended for consumers that need to compile the SDK placeholder
     * syntax for another localization runtime.
     */
    getTemplate(key: string): string | null {
        return this.#translations[key] ?? null;
    }

    /**
     * Returns the raw count-based templates for a key in the current locale.
     * Bento can represent the zero, one, and greater-than-one forms, but not
     * arbitrary exact counts above one.
     */
    getTranslationFamily(key: string): TranslationFamily {
        return {
            base: this.getTemplate(key),
            zero: this.getTemplate(`${key}__0`),
            one: this.getTemplate(`${key}__1`),
            plural: this.getTemplate(`${key}__plural`),
            unsupportedExactCounts: [...(this.#translationFamilyExactCounts.get(key) ?? [])],
        };
    }

    /**
     * Returns a boolean that checks if the translation key exists in the current {@link Localization.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns boolean
     */
    has(key: string, options?: TranslationOptions): key is TranslationKey {
        const translation = getTranslation(this.#translations, key, options);
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
