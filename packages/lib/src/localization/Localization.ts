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
    #ready: Promise<Localization> = Promise.resolve(this);

    #currentRefresh?: Promise<void>;
    #markRefreshAsDone?: () => void;

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
        let translations: CustomTranslations | undefined = undefined;
        let supportedLocales: (SupportedLocale | string)[] = DEFAULT_LOCALES;

        if (customTranslations != undefined) {
            translations = formatCustomTranslations(customTranslations, DEFAULT_LOCALES);
            const localesFromCustomTranslations = Object.keys(translations) as string[];

            // default locales + validated custom locales
            supportedLocales = [...DEFAULT_LOCALES, ...localesFromCustomTranslations].filter(
                (locale, index, locales) => locales.indexOf(locale) === index
            );
        }

        const nextLocale = Localization.#withLocale(this.#locale, supportedLocales);
        this.#refreshTranslations(nextLocale, supportedLocales, translations);
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
            const nextLocale = Localization.#withLocale(locale, this.#supportedLocales);
            if (this.#locale === nextLocale) return;
            this.#refreshTranslations(nextLocale, this.#supportedLocales, this.#customTranslations);
        } else this.locale = FALLBACK_LOCALE;
    }

    get ready() {
        return this.#ready;
    }

    get timezone(): Restamp['tz'] {
        return this.#restamp.tz;
    }

    set timezone(timezone: string | undefined | null) {
        this.#restamp.tz = timezone;
    }

    #refreshTranslations(locale: SupportedLocale | string, supportedLocales: (SupportedLocale | string)[], customTranslations?: CustomTranslations) {
        const currentRefresh = (this.#currentRefresh = Localization.#loadTranslations.call(this, locale, supportedLocales, customTranslations));

        currentRefresh.then(() => {
            if (this.#currentRefresh === currentRefresh) this.#markRefreshAsDone?.();
        });

        if (this.#markRefreshAsDone === undefined) {
            this.#eventEmitter.emit('refresh_in_progress', this);

            this.#ready = new Promise<Localization>(resolve => {
                this.#markRefreshAsDone = () => {
                    this.#currentRefresh = this.#markRefreshAsDone = undefined;
                    resolve(this);
                };
            });
        }
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
        const dateOptions = { ...DEFAULT_DATETIME_FORMAT, timeZone: this.#restamp.tz, ...options };
        return new Date(date).toLocaleDateString(this.#locale, dateOptions);
    }

    /**
     * Returns a localized string for a full date
     * @param date - Date to be localized
     */
    fullDate(date: string) {
        const [, month, day, year, time] = new Date(this.#restamp(date)).toString().split(/\s+/g);
        return `${month} ${day}, ${year}, ${time}`;
    }

    static async #loadTranslations(
        this: Localization,
        locale: SupportedLocale | string,
        supportedLocales: (SupportedLocale | string)[],
        customTranslations?: CustomTranslations
    ) {
        this.#translations = await loadTranslations(locale, customTranslations);
        this.#locale = locale;
        this.#supportedLocales = supportedLocales;
        this.#customTranslations = customTranslations;
        this.#languageCode = toTwoLetterCode(this.#locale);
        this.#lastRefreshTimestamp = performance.now();
    }

    static #withLocale(locale: SupportedLocale | string, supportedLocales: (SupportedLocale | string)[]) {
        return formatLocale(locale) || parseLocale(locale, supportedLocales) || FALLBACK_LOCALE;
    }
}
