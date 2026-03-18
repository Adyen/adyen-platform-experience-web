import type { I18n } from './types';
import fallbackTranslationsJson from '../../assets/translations/en-US.json';

type Translations = Record<string, string>;

const FALLBACK_LOCALE = 'en-US';
const FALLBACK_TRANSLATIONS: Translations = fallbackTranslationsJson as Translations;
const translationsCache = new Map<string, Promise<Translations>>();

function fetchTranslationsFromCdn(cdnTranslationsUrl: string, locale: string): Promise<Translations> {
    if (!translationsCache.has(locale)) {
        const url = `${cdnTranslationsUrl.replace(/\/$/, '')}/${locale}.json`;
        const translationPromise: Promise<Translations> = fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'default',
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
        })
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch translations for ${locale}`);
                return response.json();
            })
            .catch(() => ({}));

        translationsCache.set(locale, translationPromise);
    }

    return translationsCache.get(locale) as Promise<Translations>;
}

export function createI18n(locale: string = FALLBACK_LOCALE, cdnTranslationsUrl?: string, customTranslations?: Translations): I18n {
    const translations: Translations = { ...(customTranslations || {}) };

    const ready = (async () => {
        const localeTranslations =
            locale === FALLBACK_LOCALE || !cdnTranslationsUrl ? {} : await fetchTranslationsFromCdn(cdnTranslationsUrl, locale);

        Object.assign(translations, FALLBACK_TRANSLATIONS, localeTranslations, customTranslations);
    })();

    return {
        locale,
        ready,

        get(key: string, options?: Record<string, any>): string {
            let translation = translations[key] || key;

            if (options) {
                Object.entries(options).forEach(([k, v]) => {
                    translation = translation.replace(new RegExp(`%{${k}}`, 'g'), String(v));
                });
            }

            return translation;
        },

        has(key: string): boolean {
            return key in translations;
        },

        amount(amount: number, currencyCode: string, options?: { hideCurrency?: boolean }): string {
            const { hideCurrency = false } = options || {};

            const formatted = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                currencyDisplay: 'symbol',
            }).format(amount / 100);

            if (hideCurrency) {
                return formatted.replace(new RegExp(`[${currencyCode}\\s]`, 'gi'), '').trim();
            }

            return amount < 0 ? `- ${formatted.replace('-', '')}` : formatted;
        },

        date(date: number | string | Date, options: Intl.DateTimeFormatOptions = {}): string {
            const dateOptions: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                ...options,
            };
            return new Date(date).toLocaleDateString(locale, dateOptions);
        },

        fullDate(date: number | string | Date): string {
            return this.date(date, {
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
        },
    };
}

export const defaultI18n = createI18n();
