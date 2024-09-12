import { all_locales } from '../../../translations';
import type { SupportedLocale, Translations } from '../../../translations';

export const FALLBACK_LOCALE = 'en-US' as const;
export const SUPPORTED_LOCALES = Object.keys(all_locales)
    .sort()
    .map(locale => locale.replace('_', '-')) as SupportedLocale[];
export const DEFAULT_TRANSLATIONS: Translations = all_locales['en_US'];

export const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
export const EXCLUDE_PROPS = ['constructor', 'i18n', 'watch', 'preferredTranslations'] as const;
