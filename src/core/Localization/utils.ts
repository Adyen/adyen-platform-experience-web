import { JSX } from 'preact';
import { DEFAULT_TRANSLATIONS, FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants/localization';
import { asPlainObject, EMPTY_OBJECT, hasOwnProperty, isFunction } from '../../utils';
import type { CustomTranslations, Locale, TranslationOptions, Translations } from '../../translations';
import { SupportedLocales } from './types';

const DEFAULT_TRANSLATION_OPTIONS: TranslationOptions = { values: EMPTY_OBJECT, count: 0 } as const;
const LOCALE_FORMAT_REGEX = /^[a-z]{2}-[A-Z]{2}$/;

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
export function matchLocale(locale: string, supportedLocales: Locale[]): Locale | null {
    if (!locale) return null;
    const twoLetterCode = toTwoLetterCode(locale);
    return supportedLocales.find(supportedLocale => toTwoLetterCode(supportedLocale) === twoLetterCode) || null;
}

/**
 * Returns a locale with the proper format
 * @param locale -
 *
 * @example
 * formatLocale('En_us');
 * // 'en-US'
 */
export function formatLocale(locale: string): Locale | null {
    const localeString = locale.replace('_', '-');

    // If it's already formatted, return the locale
    if (LOCALE_FORMAT_REGEX.test(localeString)) return localeString as Locale;

    // Split the string in two
    const [languageCode, countryCode] = localeString.split('-');

    // If the locale or the country codes are missing, return null
    if (!languageCode || !countryCode) return null;

    // Ensure correct format and join the strings back together
    const fullLocale = `${languageCode.toLowerCase()}-${countryCode.toUpperCase()}` as Locale;

    return fullLocale.length === 5 ? fullLocale : null;
}

/**
 * Checks the locale format.
 * Also checks if it's on the locales array.
 * If it is not, tries to match it with one.
 * @param locale -
 * @param supportedLocales -
 */
export function parseLocale(locale: string, supportedLocales: Locale[]): Locale | null {
    const trimmedLocale = locale.trim();
    if (!trimmedLocale || trimmedLocale.length < 1 || trimmedLocale.length > 5) return FALLBACK_LOCALE;

    const formattedLocale = formatLocale(trimmedLocale);

    if (formattedLocale && supportedLocales.includes(formattedLocale)) return formattedLocale;

    return matchLocale(formattedLocale ?? trimmedLocale, supportedLocales);
}

/**
 * Formats the locales inside the customTranslations object against the supportedLocales
 * @param customTranslations -
 * @param supportedLocales -
 */
export function formatCustomTranslations(customTranslations: CustomTranslations = EMPTY_OBJECT, supportedLocales: Locale[]): CustomTranslations {
    if (customTranslations === EMPTY_OBJECT) return customTranslations;

    return (Object.keys(customTranslations) as Extract<keyof CustomTranslations, string>[]).reduce((translations, locale) => {
        const formattedLocale = formatLocale(locale) || parseLocale(locale, supportedLocales);

        if (formattedLocale && customTranslations[locale]) {
            translations[formattedLocale] = customTranslations[locale]!;
        }
        return translations;
    }, {} as CustomTranslations);
}

const replaceTranslationValues = (translation: string, values?: TranslationOptions['values']) => {
    if (isFunction(values)) {
        const repetitions = new Map<string, number>();
        let placeholderIndex = -1;

        return translation.replace(/%{(\w+)}/g, (_, placeholder) => {
            let repetitionIndex = repetitions.get(placeholder) ?? -1;
            const replacementValue = values(placeholder, ++placeholderIndex, ++repetitionIndex) ?? '';
            repetitions.set(placeholder, repetitionIndex);
            return replacementValue;
        });
    }

    return translation.replace(/%{(\w+)}/g, (_, placeholder) => values?.[placeholder] ?? '');
};

/**
 * Returns a translation string by key
 * @param translations -
 * @param key -
 * @param options -
 *
 * @internal
 */
export const getTranslation = (translations: Record<string, string>, key: string, options = DEFAULT_TRANSLATION_OPTIONS): string | null => {
    const count = options.count ?? 0;
    const countKey = `${key}__${count}`;

    // Find {key}__{count} translation key
    if (hasOwnProperty(translations, countKey) && translations[countKey]) {
        return replaceTranslationValues(translations[countKey] as string, options.values);
    }

    const pluralKey = `${key}__plural`;

    // Find {key}__plural translation key, if `count` greater than 1 (e.g. myTranslation__plural)
    if (hasOwnProperty(translations, pluralKey) && count > 1 && translations[pluralKey]) {
        return replaceTranslationValues(translations[pluralKey] as string, options.values);
    }

    // Find {key} translation key (e.g. myTranslation)
    if (hasOwnProperty(translations, key) && translations[key]) {
        return replaceTranslationValues(translations[key] as string, options.values);
    }

    return null;
};

/**
 * Returns an array with all the locales
 * @param locale - The locale the user wants to use
 * @param fetchTranslationFromCdnPromise -
 * @param customTranslations -
 */
export const loadTranslations = async (
    locale: string,
    fetchTranslationFromCdnPromise: (locale: SupportedLocales) => Promise<any>,
    customTranslations: CustomTranslations = EMPTY_OBJECT
): Promise<Translations> => {
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    const localeToLoad = parseLocale(locale, SUPPORTED_LOCALES) || FALLBACK_LOCALE;

    const loadedLocale = fetchTranslationFromCdnPromise(localeToLoad as SupportedLocales);

    return {
        ...DEFAULT_TRANSLATIONS, // Default en-US translations (in case any other translation file is missing any key)
        ...((await loadedLocale) ?? EMPTY_OBJECT), // Merge with our locale file of the locale they are loading
        ...asPlainObject(customTranslations?.[locale]), // Merge with their custom locales if available
    };
};

/**
 * Injects JSX elements in a middle of a translation and returns a JSX array
 * The input string should use %# as the token to know where to insert the component
 * @param translation - Translation string
 * @param renderFunctions - An array function that renders JSX elements
 */
export const interpolateElement = (translation: string, renderFunctions: Array<(translation: string) => JSX.Element>) => {
    // splits by regex group, it guarantees that it only splits with 2 tokens (%#)
    const matches = translation.split(/%#(.*?)%#/gm);
    // the map will create an array of JSX / string elements, this syntax in accepted in JSX/react to render elements
    return matches.map((term, index) => {
        // math to get the index of the renderFunction that should be used
        // since we split on tokens, that means the index of the render function is half of the index of the string
        const indexInFunctionArray = Math.floor(index / 2);
        return index % 2 === 0 ? term : renderFunctions[indexInFunctionArray]?.(term);
    });
};
