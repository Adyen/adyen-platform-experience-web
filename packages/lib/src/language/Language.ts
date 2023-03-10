import { formatCustomTranslations, formatLocale, getTranslation, loadTranslations, Locale, parseLocale } from './utils';
import { defaultTranslation, FALLBACK_LOCALE } from './config';
import { getLocalisedAmount } from '../utils/amount-util';
import translations from './translations/index';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export class Language {
    public readonly locale: Locale | string;
    public readonly languageCode: string;
    public translations: object = defaultTranslation;
    public readonly customTranslations: Record<`${string}-${string}`, any>;
    public loaded: Promise<any>;
    private readonly supportedLocales: Locale[];

    constructor(locale: string = FALLBACK_LOCALE, customTranslations: object = {}) {
        const defaultLocales = Object.keys(translations) as Locale[];
        this.customTranslations = formatCustomTranslations(customTranslations, defaultLocales);

        const localesFromCustomTranslations = Object.keys(this.customTranslations) as `${string}-${string}`[];
        this.supportedLocales = [...defaultLocales, ...localesFromCustomTranslations].filter((v, i, a) => a.indexOf(v) === i); // our locales + validated custom locales
        this.locale = formatLocale(locale) || parseLocale(locale, this.supportedLocales) || locale;
        const [languageCode] = this.locale.split('-');
        this.languageCode = languageCode as string;

        this.loaded = loadTranslations(this.locale, this.customTranslations).then(translations => {
            this.translations = translations;
        });
    }

    /**
     * Returns a translated string from a key in the current {@link Language.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */
    get(key: string, options?): string {
        const translation = getTranslation(this.translations, key, options);
        if (translation !== null) {
            return translation;
        }

        return key;
    }

    /**
     * Returns a localized string for an amount
     * @param amount - Amount to be converted
     * @param currencyCode - Currency code of the amount
     * @param options - Options for String.prototype.toLocaleString
     */
    amount(amount: number, currencyCode: string, options?: object): string {
        const localisedAmount = getLocalisedAmount(amount, this.locale, currencyCode, options);
        if (options && options['showSign'] && amount !== 0) {
            return localisedAmount.includes('-') ? `- ${localisedAmount.replace('-', '')}` : `+ ${localisedAmount}`;
        }
        return localisedAmount;
    }

    /**
     * Returns a localized string for a date
     * @param date - Date to be localized
     * @param options - Options for {@link Date.toLocaleDateString}
     */
    date(date: string, options: object = {}) {
        const dateOptions: DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
        return new Date(date).toLocaleDateString(this.locale, dateOptions);
    }

    /**
     * Returns a localized string for a full date
     * @param date - Date to be localized
     */
    fullDate(date: string) {
        const [, month, day, year, time] = new Date(date).toString().split(' ');
        return `${month} ${day}, ${year}, ${time}`;
    }
}

export default Language;
