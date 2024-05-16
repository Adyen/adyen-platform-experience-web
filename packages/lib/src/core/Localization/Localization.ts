import { getLocalisedAmount } from './amount/amount-util';
import { defaultTranslation, FALLBACK_LOCALE } from './constants/locale';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_LOCALES, EXCLUDE_PROPS } from './constants/localization';
import restamper, { RestamperWithTimezone, systemToTimezone } from './datetime/restamper';
import { createTranslationsLoader, getLocalizationProxyDescriptors } from './localization-utils';
import { CustomTranslations, LangFile, SupportedLocale, Translation, TranslationKey, TranslationOptions } from './types';
import { formatCustomTranslations, getTranslation, toTwoLetterCode } from './utils';
import { createWatchlist } from '../../primitives/reactive/watchlist';
import { ALREADY_RESOLVED_PROMISE, isNull, isNullish, isUndefined, noop, struct } from '../../primitives/utils';
import { en_US } from './translations';

export default class Localization {
    #locale: SupportedLocale | string = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: Readonly<SupportedLocale[]> | string[] = DEFAULT_LOCALES;

    #customTranslations?: CustomTranslations;
    #translations: Record<string, string> = defaultTranslation;
    #translationsLoader = createTranslationsLoader.call(this);

    #ready: Promise<void> = ALREADY_RESOLVED_PROMISE;
    #currentRefresh?: Promise<void>;
    #markRefreshAsDone?: () => void;
    #refreshWatchlist = createWatchlist({ timestamp: () => performance.now() });
    #restamp: RestamperWithTimezone = restamper();

    private watch = this.#refreshWatchlist.subscribe.bind(undefined);
    public i18n: Omit<Localization, (typeof EXCLUDE_PROPS)[number]> = struct(getLocalizationProxyDescriptors.call(this));
    public preferredTranslations?: { [k in SupportedLocale]?: Translation } | { [k: string]: Translation };

    constructor(locale: SupportedLocale | string = FALLBACK_LOCALE, translationsFiles?: LangFile[]) {
        this.watch(noop);

        this.preferredTranslations =
            translationsFiles &&
            translationsFiles.reduce((prev, curr) => ({ ...prev, ...curr }), {
                [FALLBACK_LOCALE]: en_US['en_US'],
            });
        this.locale = locale;
    }

    get customTranslations(): CustomTranslations {
        return this.#customTranslations ?? ({} as CustomTranslations);
    }

    set customTranslations(customTranslations: CustomTranslations | undefined | null) {
        let translations: CustomTranslations | undefined = undefined;
        let supportedLocales: (SupportedLocale | string)[] = [...DEFAULT_LOCALES];

        if (!isNullish(customTranslations)) {
            translations = formatCustomTranslations(customTranslations, DEFAULT_LOCALES);
            const localesFromCustomTranslations = Object.keys(translations) as string[];

            // default locales + validated custom locales
            supportedLocales = [...DEFAULT_LOCALES, ...localesFromCustomTranslations].filter(
                (locale, index, locales) => locales.indexOf(locale) === index
            );
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

    get locale(): SupportedLocale | string {
        return this.#locale;
    }

    set locale(locale: SupportedLocale | string | undefined | null) {
        if (!isNullish(locale)) {
            this.#translationsLoader.locale = locale;
            if (this.#locale === this.#translationsLoader.locale) return;
            this.#refreshTranslations(this.#customTranslations);
        } else this.locale = FALLBACK_LOCALE;
    }

    get ready(): Promise<void> {
        return this.#ready;
    }

    get supportedLocales(): Readonly<SupportedLocale[]> | string[] {
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
            this.#supportedLocales = this.#translationsLoader.supportedLocales;
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
        const timestamp = systemToTimezone(this.#restamp, date);
        const [, month, day, year, time] = new Date(timestamp).toString().split(/\s+/g);
        return `${month} ${day}, ${year}, ${time}`;
    }
}
