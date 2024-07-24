import { SupportedLocale } from '../types';

export const SUPPORTED_LOCALES = ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'] as const;

export const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
export const DEFAULT_LOCALES = SUPPORTED_LOCALES as Readonly<SupportedLocale[]>;
export const EXCLUDE_PROPS = ['constructor', 'i18n', 'watch', 'preferredTranslations'] as const;
