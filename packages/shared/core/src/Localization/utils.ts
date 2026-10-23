import { FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants/localization';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { AddressableTranslationKey, CustomTranslations, Locale, TranslationOptions, Translations } from '../translations';
import { SupportedLocales } from './types';

const DEFAULT_TRANSLATION_OPTIONS: TranslationOptions = { values: EMPTY_OBJECT, count: 0 } as const;
const LOCALE_FORMAT_REGEX = /^[a-z]{2}-[A-Z]{2}$/;

/**
 * Convert to ISO 639-1
 */
export const toTwoLetterCode = (locale: string) => locale.substring(0, 2).toLowerCase();

/**
 * A plural-family member probed from a translation key (e.g. `myKey__2`, `myKey__plural`).
 *
 * The suffix stays loose. `${string}__${number}` rejects a probe of a key that already contains
 * the separator, since template patterns are matched left-to-right and
 * `…linkValidityUnit.day__plural__0` would have to parse "plural__0" as a number; distributing
 * the probe over the keyspace instead pushes the comparison past the compiler's complexity limit.
 */
export type TranslationFamilyProbeKey = `${string}__${string}`;

/**
 * Any key a template resolver can be asked for: a catalog key of either keyspace, or a
 * plural-family probe of one.
 */
export type ResolvableTranslationKey = AddressableTranslationKey | TranslationFamilyProbeKey;

/**
 * Resolves the raw template for a translation key from the currently active sources.
 */
export type TranslationTemplateResolver = (key: ResolvableTranslationKey) => string | null;

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
    if (!trimmedLocale || trimmedLocale.length < 1 || trimmedLocale.length > 5) {
        return FALLBACK_LOCALE;
    }

    const formattedLocale = formatLocale(trimmedLocale);

    if (formattedLocale && supportedLocales.includes(formattedLocale)) return formattedLocale;

    return matchLocale(formattedLocale ?? trimmedLocale, supportedLocales);
}

/**
 * Formats the locales inside the customTranslations object against the supportedLocales
 * @param customTranslations -
 * @param supportedLocales -
 */
export function formatCustomTranslations(
    customTranslations: CustomTranslations = EMPTY_OBJECT as CustomTranslations,
    supportedLocales: Locale[]
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
 * @param resolveTemplate - Resolves the raw template for a key from the currently active sources
 * @param key - Translation key
 * @param options - Translation options
 *
 * @internal
 */
export const getTranslation = (
    resolveTemplate: TranslationTemplateResolver,
    key: AddressableTranslationKey,
    options = DEFAULT_TRANSLATION_OPTIONS
): string | null => {
    const count = options.count ?? 0;
    const countKey: TranslationFamilyProbeKey = `${key}__${count}`;

    // Find {key}__{count} translation key
    const exactCountTemplate = resolveTemplate(countKey);
    if (exactCountTemplate) {
        return replaceTranslationValues(exactCountTemplate, options.values);
    }

    // The plural form only applies above one, so the probe string is not built for the common
    // uncounted call (count defaults to zero).
    if (count > 1) {
        const pluralKey: TranslationFamilyProbeKey = `${key}__plural`;

        // Find {key}__plural translation key (e.g. myTranslation__plural)
        const pluralTemplate = resolveTemplate(pluralKey);
        if (pluralTemplate) {
            return replaceTranslationValues(pluralTemplate, options.values);
        }
    }

    // Find {key} translation key (e.g. myTranslation)
    const template = resolveTemplate(key);
    if (template) {
        return replaceTranslationValues(template, options.values);
    }

    return null;
};

/**
 * Returns the catalog of a locale, fetched from the CDN or bundled, or null when no source is
 * available. The caller layers custom translations and the en-US defaults on top of it (see
 * `Localization`).
 *
 * @param locale - The locale the user wants to use
 * @param fetchTranslationFromCdnPromise - Resolves the locale's catalog
 */
export const loadTranslations = async (
    locale: string,
    fetchTranslationFromCdnPromise: (locale: SupportedLocales) => Promise<Translations | null>
): Promise<Translations | null> => {
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    const localeToLoad = parseLocale(locale, SUPPORTED_LOCALES) || FALLBACK_LOCALE;

    return (await fetchTranslationFromCdnPromise(localeToLoad as SupportedLocales)) ?? null;
};
