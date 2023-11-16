import { SupportedLocale } from '../types';

export const SUPPORTED_LOCALES = [
    'ar',
    'cs-CZ',
    'da-DK',
    'de-DE',
    'el-GR',
    'en-US',
    'es-ES',
    'fi-FI',
    'fr-FR',
    'hr-HR',
    'hu-HU',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'nl-NL',
    'no-NO',
    'pl-PL',
    'pt-BR',
    'pt-PT',
    'ro-RO',
    'ru-RU',
    'sk-SK',
    'sl-SI',
    'sv-SE',
    'zh-CN',
    'zh-TW',
] as const;

export const DEFAULT_DATETIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
export const DEFAULT_LOCALES = SUPPORTED_LOCALES as Readonly<SupportedLocale[]>;
export const EXCLUDE_PROPS = ['constructor', 'i18n', 'watch', 'preferredTranslations'] as const;
