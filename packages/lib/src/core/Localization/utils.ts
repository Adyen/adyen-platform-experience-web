import { asPlainObject, EMPTY_OBJECT, hasOwnProperty } from '../../utils';
import { defaultTranslation, FALLBACK_LOCALE, LOCALE_FORMAT_REGEX } from './constants/locale';
import { CustomTranslations, SupportedLocale, Translations, TranslationOptions } from './types';
import { en_US } from '../../translations';

const DEFAULT_TRANSLATION_OPTIONS: TranslationOptions = { values: EMPTY_OBJECT, count: 0 } as const;
const FALLBACK_TRANSLATIONS_FILES = { 'en-US': en_US['en_US'] } as const;

/**
 * Convert to ISO 639-1
 */
export const toTwoLetterCode = (locale: string) => locale.substring(0, 2).toLowerCase();

/**
 * Matches a string with one of the locales
 * @param locale -
 * @param supportedLocales -

 * @example
 * matchLocale('en-GB');
 * // 'en-US'
 */
export function matchLocale(locale: string, supportedLocales: SupportedLocale[] | string[]): SupportedLocale | null {
    if (!locale) return null;
    const twoLetterCode = toTwoLetterCode(locale as SupportedLocale);
    return (supportedLocales.find(supportedLocale => toTwoLetterCode(supportedLocale) === twoLetterCode) as SupportedLocale) || null;
}

/**
 * Returns a locale with the proper format
 * @param locale -
 *
 * @example
 * formatLocale('En_us');
 * // 'en-US'
 */
export function formatLocale(locale: string): SupportedLocale | null {
    const localeString = locale.replace('_', '-');

    // If it's already formatted, return the locale
    if (LOCALE_FORMAT_REGEX.test(localeString)) return localeString as SupportedLocale;

    // Split the string in two
    const [languageCode, countryCode] = localeString.split('-');

    // If the locale or the country codes are missing, return null
    if (!languageCode || !countryCode) return null;

    // Ensure correct format and join the strings back together
    const fullLocale = `${languageCode.toLowerCase()}-${countryCode.toUpperCase()}` as SupportedLocale;

    return fullLocale.length === 5 ? fullLocale : null;
}

/**
 * Checks the locale format.
 * Also checks if it's on the locales array.
 * If it is not, tries to match it with one.
 * @param locale -
 * @param supportedLocales -
 */
export function parseLocale(locale: string, supportedLocales: Readonly<SupportedLocale[]> | string[]): SupportedLocale | null {
    const trimmedLocale = locale.trim();

    if (!trimmedLocale || trimmedLocale.length < 1 || trimmedLocale.length > 5) return FALLBACK_LOCALE;

    const formattedLocale = formatLocale(trimmedLocale);

    if (formattedLocale && supportedLocales.indexOf(formattedLocale) > -1) return formattedLocale;

    return matchLocale(formattedLocale ?? trimmedLocale, [...supportedLocales]);
}

/**
 * Formats the locales inside the customTranslations object against the supportedLocales
 * @param customTranslations -
 * @param supportedLocales -
 */
export function formatCustomTranslations(
    customTranslations: CustomTranslations = EMPTY_OBJECT,
    supportedLocales: Readonly<SupportedLocale[]> | string[]
): CustomTranslations {
    if (customTranslations === EMPTY_OBJECT) return customTranslations;

    return (Object.keys(customTranslations) as Extract<keyof CustomTranslations, string>[]).reduce((translations, locale) => {
        const formattedLocale = formatLocale(locale) || parseLocale(locale, supportedLocales);
        if (formattedLocale && customTranslations[locale]) {
            translations[formattedLocale] = customTranslations[locale]!;
        }
        return translations;
    }, {} as CustomTranslations);
}

/**
 * Returns an array with all the locales
 * @param locale - The locale the user wants to use
 * @param translations -
 * @param customTranslations -
 */
export const loadTranslations = async (
    locale: string,
    translations?: { [locale: string]: Translations },
    customTranslations: CustomTranslations = EMPTY_OBJECT
) => {
    const translationFiles = translations ?? FALLBACK_TRANSLATIONS_FILES;
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    const localeToLoad = parseLocale(locale, Object.keys(translationFiles) as SupportedLocale[]) || FALLBACK_LOCALE;
    const loadedLocale = translationFiles[localeToLoad as keyof typeof translationFiles] || translationFiles[FALLBACK_LOCALE];

    return {
        ...defaultTranslation, // Default en-US translations (in case any other translation file is missing any key)
        ...loadedLocale, // Merge with our locale file of the locale they are loading
        ...asPlainObject(customTranslations?.[locale]), // Merge with their custom locales if available
    };
};
