import { DEFAULT_DATETIME_FORMAT, DEFAULT_TRANSLATIONS, EXCLUDE_PROPS, FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants/localization';
import type {
    CustomTranslations,
    Locale,
    TranslationKey,
    TranslationOptions,
    Translations,
    TranslationSource,
    TranslationSourceRecord,
} from '../../translations';
import { getLocalisedAmount } from './amount/amount-util';
import restamper, { RestamperWithTimezone } from './datetime/restamper';
import { createTranslationsLoader, getLocalizationProxyDescriptors } from './localization-utils';
import { formatCustomTranslations, getTranslation, toTwoLetterCode } from './utils';
import { createWatchlist } from '../../primitives/reactive/watchlist';
import { ALREADY_RESOLVED_PROMISE, isNull, isNullish, isUndefined, noop, struct } from '../../utils';

const defaultTranslations = { [FALLBACK_LOCALE]: DEFAULT_TRANSLATIONS };

export default class Localization {
    #locale: Locale = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: Readonly<Locale[]> = SUPPORTED_LOCALES;

    #customTranslations?: CustomTranslations;
    #translations: Translations = DEFAULT_TRANSLATIONS;
    #translationsLoader = createTranslationsLoader.call(this);

    #ready: Promise<void> = ALREADY_RESOLVED_PROMISE;
    #currentRefresh?: Promise<void>;
    #markRefreshAsDone?: () => void;
    #refreshWatchlist = createWatchlist({ timestamp: () => performance.now() });
    #restamp: RestamperWithTimezone = restamper();

    private watch = this.#refreshWatchlist.subscribe.bind(undefined);
    public i18n: Omit<Localization, (typeof EXCLUDE_PROPS)[number]> = struct(getLocalizationProxyDescriptors.call(this));
    public preferredTranslations?: Readonly<{ [k: Locale]: TranslationSource }>;

    constructor(locale: string = FALLBACK_LOCALE, availableTranslations?: TranslationSourceRecord[]) {
        this.watch(noop);

        this.preferredTranslations = Object.freeze(
            availableTranslations?.reduce((records, curr) => ({ ...records, ...curr }), defaultTranslations) ?? defaultTranslations
        );

        this.locale = locale;
    }

    get customTranslations(): CustomTranslations {
        return this.#customTranslations ?? ({} as CustomTranslations);
    }

    set customTranslations(customTranslations: CustomTranslations | undefined | null) {
        let translations: CustomTranslations | undefined = undefined;
        let supportedLocales: Locale[] = SUPPORTED_LOCALES;

        if (!isNullish(customTranslations)) {
            translations = formatCustomTranslations(customTranslations, supportedLocales);
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
        } else this.locale = FALLBACK_LOCALE;
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
            if (this.#currentRefresh === currentRefresh) this.#markRefreshAsDone?.();
        };

        const currentRefresh = (this.#currentRefresh = (async () => {
            this.#translations = await this.#translationsLoader.load(customTranslations);
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
