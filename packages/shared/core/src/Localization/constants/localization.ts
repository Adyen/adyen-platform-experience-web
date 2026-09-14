import { defaultTranslations, type Locale, type Translations } from '../../translations';

export const FALLBACK_LOCALE = 'en-US' as const;
export const DEFAULT_TRANSLATIONS: Translations = defaultTranslations;
export const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
export const EXCLUDE_PROPS = ['constructor', 'i18n', 'watch'] as const;

export const SUPPORTED_LOCALES = [
    'da-DK',
    'de-DE',
    'en-US',
    'es-ES',
    'fi-FI',
    'fr-FR',
    'it-IT',
    'nl-NL',
    'no-NO',
    'pt-BR',
    'sv-SE',
] satisfies Locale[];
