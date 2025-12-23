import { en_US } from '../../../translations';
import type { Locale, Translations, TranslationSource } from '../../../translations';

export const FALLBACK_LOCALE = 'en-US' as const;
export const DEFAULT_TRANSLATIONS: Translations = en_US['en_US'];
export const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
export const EXCLUDE_PROPS = ['constructor', 'i18n', 'watch', 'preferredTranslations'] as const;

export const getLocalesFromTranslationSourcesRecord = (sources: Record<Locale, TranslationSource>) =>
    [
        ...new Set(
            Object.keys(sources)
                .map(locale => locale.replace(/_/g, '-'))
                .sort()
        ),
    ] as Locale[];

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
