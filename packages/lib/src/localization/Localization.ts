import { getLocalisedAmount } from './amount/amount-util';
import { defaultTranslation, FALLBACK_LOCALE } from './constants/locale';
import restamper from './datetime/restamper';
import translations from './translations';
import { CurrencyCode, CustomTranslations, Restamp, SupportedLocale, TranslationKey, TranslationOptions } from './types';
import { formatCustomTranslations, formatLocale, getTranslation, loadTranslations, parseLocale, toTwoLetterCode } from './utils';
import EventEmitter from '@src/components/external/EventEmitter';

const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
const DEFAULT_LOCALES = Object.keys(translations) as SupportedLocale[];
const EXCLUDE_PROPS = ['constructor', 'i18n', 'listen', 'unlisten'] as const;

function getLocalizationProxyDescriptors(this: Localization) {
    const descriptors = {} as any;

    for (const [prop, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(Localization.prototype))) {
        if (EXCLUDE_PROPS.includes(prop as (typeof EXCLUDE_PROPS)[number])) continue;

        if (typeof descriptor.get === 'function') {
            descriptors[prop] = { get: descriptor.get.bind(this) };
        } else if (typeof descriptor.value === 'function') {
            descriptors[prop] = { value: descriptor.value.bind(this) };
        } else {
            descriptors[prop] = { get: () => this[prop as keyof Localization] };
        }
    }

    return descriptors as { [K in keyof Localization['i18n']]: PropertyDescriptor };
}

export default class Localization {
    #locale: SupportedLocale | string = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: (SupportedLocale | string)[] = DEFAULT_LOCALES;

    #customTranslations?: CustomTranslations;
    #translations: Record<string, string> = defaultTranslation;
    #ready?: Promise<Localization>;

    #restamp: Restamp = restamper();
    #lastRefreshTimestamp: DOMHighResTimeStamp = performance.now();
    #eventEmitter: EventEmitter = new EventEmitter(); // [TODO]: Swap this with a watchable in the future

    listen = this.#eventEmitter.on.bind(this.#eventEmitter);
    unlisten = this.#eventEmitter.off.bind(this.#eventEmitter);

    i18n: Omit<Localization, (typeof EXCLUDE_PROPS)[number]> = Object.create(null, getLocalizationProxyDescriptors.call(this));

    constructor(locale: SupportedLocale | string = FALLBACK_LOCALE) {
        this.locale = locale;
    }

    get customTranslations(): CustomTranslations {
        return this.#customTranslations ?? ({} as CustomTranslations);
    }

    set customTranslations(customTranslations: CustomTranslations | undefined | null) {
        if (customTranslations != undefined) {
            this.#customTranslations = formatCustomTranslations(customTranslations, DEFAULT_LOCALES);
            const localesFromCustomTranslations = Object.keys(this.#customTranslations) as string[];

            // default locales + validated custom locales
            this.#supportedLocales = [...DEFAULT_LOCALES, ...localesFromCustomTranslations].filter(
                (locale, index, locales) => locales.indexOf(locale) === index
            );
        } else {
            this.#customTranslations = undefined;
            this.#supportedLocales = DEFAULT_LOCALES;
        }

        this.locale = this.#locale;
        this.#refreshTranslations();
    }

    get languageCode() {
        return this.#languageCode;
    }

    get lastRefreshTimestamp() {
        return this.#lastRefreshTimestamp;
    }

    get locale(): SupportedLocale | string {
        return this.#locale;
    }

    set locale(locale: SupportedLocale | string | undefined | null) {
        if (locale != undefined) {
            const nextLocale = formatLocale(locale) || parseLocale(locale, this.#supportedLocales) || FALLBACK_LOCALE;

            if (this.#locale !== nextLocale) {
                this.#locale = nextLocale;
                this.#languageCode = toTwoLetterCode(this.#locale);
                this.#refreshTranslations();
            }
        } else this.locale = FALLBACK_LOCALE;
    }

    get ready(): Promise<Localization> {
        return Promise.resolve(this.#ready ?? this);
    }

    get timezone(): Restamp['tz'] {
        return this.#restamp.tz;
    }

    set timezone(timezone: string | undefined | null) {
        this.#restamp.tz = timezone;
    }

    #refreshTranslations() {
        // [TODO]: Handle promise rejection
        this.#ready = loadTranslations(this.#locale, this.#customTranslations).then(translations => {
            this.#translations = translations;
            this.#lastRefreshTimestamp = performance.now();
            return this;
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
        return translation !== null ? translation : key;
    }

    /**
     * Returns a localized string for an amount
     * @param amount - Amount to be converted
     * @param currencyCode - Currency code of the amount
     * @param options - Options for String.prototype.toLocaleString
     */
    amount(amount: number, currencyCode: CurrencyCode, options?: Record<string, any>): string {
        const localisedAmount = getLocalisedAmount(amount, this.#locale, currencyCode, options);
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
    date(date: string, options: Intl.DateTimeFormatOptions = {}) {
        const dateOptions = { ...DEFAULT_DATETIME_FORMAT, ...options };
        return new Date(this.#restamp(date)).toLocaleDateString(this.#locale, dateOptions);
    }

    /**
     * Returns a localized string for a full date
     * @param date - Date to be localized
     */
    fullDate(date: string) {
        const [, month, day, year, time] = new Date(this.#restamp(date)).toString().split(/\s+/g);
        return `${month} ${day}, ${year}, ${time}`;
    }
}
