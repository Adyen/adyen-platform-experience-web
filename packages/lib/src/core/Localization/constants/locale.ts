import defaultLocaleTranslation from '../translations/en-US.json';

/**
 * FALLBACK_LOCALE - **MUST** match the locale string in the above import
 */

export const FALLBACK_LOCALE = 'en-US' as const;
export const LOCALE_FORMAT_REGEX = /^[a-z]{2}-[A-Z]{2}$/;
export const defaultTranslation = defaultLocaleTranslation;
