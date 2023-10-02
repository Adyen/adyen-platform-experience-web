import translations from '../translations';
import { SupportedLocale } from '../types';

export const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
export const DEFAULT_LOCALES = Object.keys(translations) as SupportedLocale[];
export const EXCLUDE_PROPS = ['constructor', 'i18n', 'listen', 'unlisten'] as const;
