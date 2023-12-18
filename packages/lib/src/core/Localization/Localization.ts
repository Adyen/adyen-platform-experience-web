import { getLocalisedAmount } from './amount/amount-util';
import { defaultTranslation, FALLBACK_LOCALE } from './constants/locale';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_LOCALES, EXCLUDE_PROPS } from './constants/localization';
import restamper from './datetime/restamper';
import { createTranslationsLoader, getLocalizationProxyDescriptors } from './localization-utils';
import {
    CurrencyCode,
    CustomTranslations,
    LangFile,
    Restamp,
    SupportedLocale,
    Translation,
    TranslationKey,
    TranslationOptions,
    TranslationsRefreshWatchable,
    TranslationsRefreshWatchCallback,
} from './types';
import { formatCustomTranslations, getTranslation, toTwoLetterCode } from './utils';
import { EMPTY_OBJECT, noop, struct } from '@src/utils/common';
import watchable from '@src/utils/watchable';
import { en_US } from './translations';

export default class Localization {
    #locale: SupportedLocale | string = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: Readonly<SupportedLocale[]> | string[] = DEFAULT_LOCALES;

    #customTranslations?: CustomTranslations;
    #translations: Record<string, string> = defaultTranslation;
    #translationsLoader = createTranslationsLoader.call(this);

    #ready: Promise<void> = Promise.resolve();
    #currentRefresh?: Promise<void>;
    #markRefreshAsDone?: () => void;
    #refreshWatchable: TranslationsRefreshWatchable = watchable({ timestamp: () => performance.now() });
    #restamp: Restamp = restamper();

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
        return this.#refreshWatchable.snapshot.timestamp;
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

    get supportedLocales(): Readonly<SupportedLocale[]> | string[] {
        return this.#supportedLocales;
    }

    get timezone(): Restamp['tz'] {
        return this.#restamp.tz;
    }

    set timezone(timezone: string | undefined | null) {
        this.#restamp.tz = timezone;
    }

    get translations() {
        return this.#translations;
    }

    #refreshTranslations(customTranslations?: CustomTranslations) {
        if (this.#markRefreshAsDone === undefined) {
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
            this.#supportedLocales = this.#translationsLoader.supportedLocales;
            this.#locale = this.#translationsLoader.locale;
            this.#languageCode = toTwoLetterCode(this.#locale);
            this.#customTranslations = customTranslations;
            this.#refreshWatchable.notify();
        })());

        currentRefresh.then(currentRefreshDone).catch(reason => {
            currentRefreshDone();
            if (import.meta.env.DEV) {
                // handle current refresh promise rejection
                // throw reason;
                console.error(reason);
            }
        });
    }

    watch(callback: TranslationsRefreshWatchCallback) {
        return this.#refreshWatchable.watch(callback);
    }

    /**
     * Returns a translated string from a key in the current {@link Localization.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @param translations — Translations object
     * @returns Translated string
     */
    get(key: TranslationKey, options: TranslationOptions = EMPTY_OBJECT, translations = this.#translations): string {
        const translation = getTranslation(translations, key, options);
        return translation !== null ? translation : key;
    }

    /**
     * Returns a localized string for an amount
     * @param amount - Amount to be converted
     * @param currencyCode - Currency code of the amount
     * @param options - Options for String.prototype.toLocaleString
     */
    amount(amount: number, currencyCode: string, options?: Record<string, any>): string {
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
