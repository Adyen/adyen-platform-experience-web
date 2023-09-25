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

function createTranslationsLoader(this: Localization) {
    type TranslationsLoader = {
        load: (customTranslations?: CustomTranslations) => ReturnType<typeof loadTranslations>;
        locale: SupportedLocale | string;
        supportedLocales: (SupportedLocale | string)[];
    };

    let _locale = this.locale;
    let _supportedLocales = this.supportedLocales;

    return Object.create(null, {
        load: { value: (customTranslations?: CustomTranslations) => loadTranslations(_locale, customTranslations) },
        locale: {
            get: () => _locale,
            set: (locale: SupportedLocale | string) => {
                _locale = formatLocale(locale) || parseLocale(locale, _supportedLocales) || FALLBACK_LOCALE;
            },
        },
        supportedLocales: {
            get: () => _locale,
            set(this: TranslationsLoader, supportedLocales: (SupportedLocale | string)[]) {
                _supportedLocales = supportedLocales;
                this.locale = _locale;
            },
        },
    }) as TranslationsLoader;
}

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
    #translationsLoader = createTranslationsLoader.call(this);
    #ready: Promise<void> = Promise.resolve();

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

        this.#translationsLoader.supportedLocales = supportedLocales;
        this.#refreshTranslations(translations);
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
            this.#translationsLoader.locale = locale;
            if (this.#locale === this.#translationsLoader.locale) return;
            this.#refreshTranslations(this.#customTranslations);
        } else this.locale = FALLBACK_LOCALE;
    }

    get ready(): Promise<void> {
        return this.#ready;
    }

    get supportedLocales(): (SupportedLocale | string)[] {
        return this.#supportedLocales;
    }

    get timezone(): Restamp['tz'] {
        return this.#restamp.tz;
    }

    set timezone(timezone: string | undefined | null) {
        this.#restamp.tz = timezone;
    }

    #refreshTranslations(customTranslations?: CustomTranslations) {
        if (this.#markRefreshAsDone === undefined) {
            // [TODO]: Move event name to enum
            this.#eventEmitter.emit('refresh_in_progress');

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
            this.#lastRefreshTimestamp = performance.now();
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
}
