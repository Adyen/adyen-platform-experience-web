import { getLocalisedAmount } from './amount/amount-util';
import { defaultTranslation, FALLBACK_LOCALE } from './constants/locale';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_LOCALES, EXCLUDE_PROPS } from './constants/localization';
import restamper from './datetime/restamper';
import { createTranslationsLoader, getLocalizationProxyDescriptors } from './localization-utils';
import {
    CurrencyCode,
    CustomTranslations,
    Restamp,
    SupportedLocale,
    TranslationKey,
    TranslationOptions,
    Translations,
    TranslationsLoader,
} from './types';
import { formatCustomTranslations, getTranslation, toTwoLetterCode } from './utils';
import { createScopeChain } from '@src/utils/createScopeChain';
import { noop, struct } from '@src/utils/common';
import watchable from '@src/utils/watchable';
import { WatchCallable } from '@src/utils/watchable/types';

type TranslationsScopeChain = ReturnType<
    typeof createScopeChain<{
        readonly translations: Translations;
    }>
>;

export default class Localization {
    #locale: SupportedLocale | string = FALLBACK_LOCALE;
    #languageCode: string = toTwoLetterCode(this.#locale);
    #supportedLocales: (SupportedLocale | string)[] = DEFAULT_LOCALES;

    #customTranslations?: CustomTranslations;
    #translations: Record<string, string> = defaultTranslation;
    #translationsLoader = createTranslationsLoader.call(this);

    #nestedTranslationsCache = new WeakMap<TranslationsLoader, Promise<Translations>>();
    #translationsChain: TranslationsScopeChain = createScopeChain();
    #resetTranslationsChain = noop;

    #ready: Promise<void> = Promise.resolve();
    #currentRefresh?: Promise<void>;
    #markRefreshAsDone?: () => void;
    #refreshWatchable = watchable({ timestamp: () => performance.now() });
    #restamp: Restamp = restamper();

    watch = this.#refreshWatchable.watch.bind(undefined);
    i18n: Omit<Localization, (typeof EXCLUDE_PROPS)[number]> = struct(getLocalizationProxyDescriptors.call(this));

    constructor(locale: SupportedLocale | string = FALLBACK_LOCALE) {
        this.#translationsChainReset();
        this.watch(noop);
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
            const locale = this.#locale;

            this.#translations = await this.#translationsLoader.load(customTranslations);
            this.#supportedLocales = this.#translationsLoader.supportedLocales;
            this.#locale = this.#translationsLoader.locale;
            this.#languageCode = toTwoLetterCode(this.#locale);
            this.#customTranslations = customTranslations;

            if (this.#locale !== locale) {
                this.#nestedTranslationsCache = new WeakMap();
            }

            this.#translationsChainReset();
            this.#refreshWatchable.notify();
        })());

        currentRefresh.then(currentRefreshDone).catch(reason => {
            currentRefreshDone();
            // handle current refresh promise rejection
            // throw reason;
            console.error(reason);
        });
    }

    #translationsChainReset() {
        this.#resetTranslationsChain();
        this.#resetTranslationsChain = () =>
            this.#translationsChain.add({
                translations: this.#translations,
            });
    }

    load(loadTranslations?: TranslationsLoader, readyCallback?: WatchCallable<any>): ReturnType<TranslationsScopeChain['add']> {
        if (typeof loadTranslations !== 'function') return noop;

        let translations = {} as Translations;

        const promise = this.#nestedTranslationsCache.get(loadTranslations);
        const translationsPromise = promise ?? (async () => ({ ...(await loadTranslations(this.#locale)) }))();

        if (promise === undefined) {
            this.#nestedTranslationsCache.set(loadTranslations, translationsPromise);
        }

        const unloadTranslations = this.#translationsChain.add({
            get translations() {
                return translations;
            },
        });

        translationsPromise
            .then(async value => {
                translations = value;
                readyCallback?.();
            })
            .catch(reason => {
                unloadTranslations(true);
                console.error(reason);
            });

        return unloadTranslations;
    }

    /**
     * Returns a translated string from a key in the current {@link Localization.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */
    get(key: TranslationKey, options?: TranslationOptions): string {
        for (const scope of this.#translationsChain.current) {
            if (!scope) continue;
            const translation = getTranslation(scope.translations, key, options);
            if (translation !== null) return translation;
        }

        return key;
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
