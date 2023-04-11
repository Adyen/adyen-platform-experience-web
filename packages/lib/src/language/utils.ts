import { h } from 'preact';
import { defaultTranslation, FALLBACK_LOCALE } from './config';
import translations from './translations';
import { CustomTranslations, TranslationOptions } from './types';

export type LocaleKey = keyof typeof translations;

/**
 * Convert to ISO 639-1
 */
const toTwoLetterCode = (locale: LocaleKey | string) => locale.toLowerCase().substring(0, 2);

/**
 * Matches a string with one of the locales
 * @param locale -
 * @param supportedLocales -

 * @example
 * matchLocale('en-GB');
 * // 'en-US'
 */
export function matchLocale(locale: LocaleKey | string, supportedLocales: LocaleKey[] | string[]): LocaleKey | null {
    if (!locale || typeof locale !== 'string') return null;
    return (supportedLocales.find(supLoc => toTwoLetterCode(supLoc) === toTwoLetterCode(locale)) as LocaleKey) || null;
}

/**
 * Returns a locale with the proper format
 * @param localeParam -
 *
 * @example
 * formatLocale('En_us');
 * // 'en-US'
 */
export function formatLocale(localeParam: string): LocaleKey | null {
    const locale = localeParam.replace('_', '-');
    const format = new RegExp('([a-z]{2})([-])([A-Z]{2})');

    // If it's already formatted, return the locale
    if (format.test(locale)) return locale as LocaleKey;

    // Split the string in two
    const [languageCode, countryCode] = locale.split('-');

    // If the locale or the country codes are missing, return null
    if (!languageCode || !countryCode) return null;

    // Ensure correct format and join the strings back together
    const fullLocale = `${languageCode.toLowerCase()}-${countryCode.toUpperCase()}` as LocaleKey;

    return fullLocale.length === 5 ? fullLocale : null;
}

/**
 * Checks the locale format.
 * Also checks if it's on the locales array.
 * If it is not, tries to match it with one.
 * @param locale -
 * @param supportedLocales -
 */
export function parseLocale(locale: LocaleKey | string, supportedLocales: LocaleKey[] | string[]): LocaleKey | null {
    if (!locale || locale.length < 1 || locale.length > 5) return FALLBACK_LOCALE;

    const formattedLocale = formatLocale(locale);
    const hasMatch = formattedLocale && supportedLocales.indexOf(formattedLocale) > -1;

    if (hasMatch) return formattedLocale;

    return matchLocale(formattedLocale ?? locale, supportedLocales);
}

/**
 * Formats the locales inside the customTranslations object against the supportedLocales
 * @param customTranslations -
 * @param supportedLocales -
 */
export function formatCustomTranslations(customTranslations: CustomTranslations = {}, supportedLocales: LocaleKey[] | string[]): Record<string, any> {
    return (Object.keys(customTranslations) as Extract<keyof CustomTranslations, string>[]).reduce((acc, cur) => {
        const formattedLocale = formatLocale(cur) || parseLocale(cur, supportedLocales);
        if (formattedLocale && customTranslations[cur]) {
            acc[formattedLocale] = customTranslations[cur]!;
        }
        return acc;
    }, {} as CustomTranslations);
}

const replaceTranslationValues = (translation: string, values?: Record<string, any>) => {
    return translation.replace(/%{(\w+)}/g, (_, k) => values?.[k] || '');
};

/**
 * Returns a translation string by key
 * @param translations -
 * @param key -
 * @param options -
 *
 * @internal
 */
export const getTranslation = (
    translations: Record<string, string>,
    key: string,
    options: TranslationOptions = { values: {}, count: 0 }
): string | null => {
    const keyPlural = `${key}__plural`;
    const keyForCount = (count: number) => `${key}__${count}`;
    const count = options.count ?? 0;
    if (Object.prototype.hasOwnProperty.call(translations, keyForCount(count)) && translations[keyForCount(count)]) {
        // Find key__count translation key
        return replaceTranslationValues(translations[keyForCount(count)] ?? '', options.values);
    } else if (Object.prototype.hasOwnProperty.call(translations, keyPlural) && count > 1 && translations[keyPlural]) {
        // Find key__plural translation key, if count greater than 1 (e.g. myTranslation__plural)
        return replaceTranslationValues(translations[keyPlural] ?? '', options.values);
    } else if (Object.prototype.hasOwnProperty.call(translations, key) && translations[key]) {
        // Find key translation key (e.g. myTranslation)
        return replaceTranslationValues(translations[key] ?? '', options.values);
    }

    return null;
};

/**
 * Returns an array with all the locales
 * @param locale - The locale the user wants to use
 * @param customTranslations -
 */
export const loadTranslations = async (locale: LocaleKey | string, customTranslations: CustomTranslations = {}) => {
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    const localeToLoad = parseLocale(locale, Object.keys(translations) as LocaleKey[]) || FALLBACK_LOCALE;
    const loadedLocale = await translations[localeToLoad]();

    return {
        ...defaultTranslation, // Default en-US translations (in case any other translation file is missing any key)
        ...loadedLocale.default, // Merge with our locale file of the locale they are loading
        ...(!!customTranslations[locale] && customTranslations[locale]), // Merge with their custom locales if available
    };
};

/**
 * Injects JSX elements in a middle of a translation and returns a JSX array
 * The input string should use %# as the token to know where to insert the component
 * @param translation - Translation string
 * @param renderFunctions - An array function that renders JSX elements
 */
export const interpolateElement = (translation: string, renderFunctions: Array<(translation: string) => h.JSX.Element>) => {
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
