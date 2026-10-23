import {
    formatCustomTranslations,
    formatLocale,
    getTranslation,
    matchLocale,
    parseLocale,
    loadTranslations,
    type TranslationTemplateResolver,
} from './utils';
import { describe, expect, test } from 'vitest';
import { SUPPORTED_LOCALES } from './constants/localization';
import { translationsDevAssets } from '../translations/local';
import type { TranslationKey } from '../translations';

const defaultSupportedLocales = SUPPORTED_LOCALES;
const translationKey = 'abc' as TranslationKey;

describe('parseLocale()', () => {
    test('should return the passed locale if formatted properly', () => {
        expect(parseLocale('da-DK', defaultSupportedLocales)).toBe('da-DK');
        expect(parseLocale('en-US', defaultSupportedLocales)).toBe('en-US');
        // expect(parseLocale('zh-TW', defaultSupportedLocales)).toBe('zh-TW');
        // expect(parseLocale('zh-CN', defaultSupportedLocales)).toBe('zh-CN');
    });

    test('should return a properly formatted locale if not formatted', () => {
        const locale = 'En_us';
        expect(parseLocale(locale, defaultSupportedLocales)).toBe('en-US');
    });

    test('should return a properly formatted locale when a partial locale is sent in', () => {
        const locale = 'nl';
        expect(parseLocale(locale, defaultSupportedLocales)).toBe('nl-NL');
    });

    test('should return the FALLBACK_LOCALE when an incorrect locale is sent in', () => {
        expect(parseLocale('default', defaultSupportedLocales)).toBe('en-US');
        expect(parseLocale('english', defaultSupportedLocales)).toBe('en-US');
        expect(parseLocale('spanish', defaultSupportedLocales)).toBe('en-US');
    });

    test('should return FALLBACK_LOCALE when an empty string is send', () => {
        expect(parseLocale('', defaultSupportedLocales)).toBe('en-US');
    });

    test('should return null when a locale is not matched', () => {
        const locale = 'xx_XX';
        expect(parseLocale(locale, defaultSupportedLocales)).toBe(null);
    });

    test('should return a formatted locale when called with an underscored locale like en_US', () => {
        const locale = 'en_US';
        expect(parseLocale(locale, defaultSupportedLocales)).toBe('en-US');
    });

    test('should return the matched language when called with a non-proper locale like es&ES', () => {
        const locale = 'es&ES';
        expect(parseLocale(locale, defaultSupportedLocales)).toBe('es-ES');
    });
});

describe('matchLocale()', () => {
    test('should match a two letter code', () => {
        expect(matchLocale('en', [...defaultSupportedLocales])).toBe('en-US');
        expect(matchLocale('es', [...defaultSupportedLocales])).toBe('es-ES');
    });

    test('should return null if it cannot match the locale', () => {
        expect(matchLocale('ca', [...defaultSupportedLocales])).toBe(null);
        expect(matchLocale('ne', [...defaultSupportedLocales])).toBe(null);
        expect(matchLocale('123', [...defaultSupportedLocales])).toBe(null);
    });
});

describe('formatLocale()', () => {
    test('should not do anything if the locale is already formatted', () => {
        expect(formatLocale('en-US')).toBe('en-US');
        expect(formatLocale('es-ES')).toBe('es-ES');
    });

    test('should return null if the locale is missing a part or it is not properly separated', () => {
        expect(formatLocale('en')).toBe(null);
        expect(formatLocale('enUS')).toBe(null);
    });

    test('should return a formatted locale when called with an underscored locale like en_US', () => {
        expect(formatLocale('en_us')).toBe('en-US');
    });

    test('should return a formatted locale when called with a lowercase locale like en-us', () => {
        expect(formatLocale('en-us')).toBe('en-US');
    });
});

describe('getTranslation()', () => {
    const key = 'myTranslation' as TranslationKey;

    const resolverFor =
        (templates: Record<string, string>): TranslationTemplateResolver =>
        probedKey =>
            templates[probedKey] ?? null;

    const family = resolverFor({
        myTranslation: 'My translation',
        myTranslation__plural: 'My translations',
        myTranslation__2: 'My two translations',
    });

    test('should get a translation with a matching key', () => {
        expect(getTranslation(family, key)).toBe('My translation');
    });

    test('should get a translation with values', () => {
        expect(getTranslation(resolverFor({ myTranslation: 'My %{type} translation' }), key, { values: { type: 'custom' } })).toBe(
            'My custom translation'
        );
    });

    test('should get a translation with empty values', () => {
        expect(getTranslation(resolverFor({ myTranslation: 'My %{type} translation' }), key)).toBe('My  translation');
    });

    test('should get a plural translation if available', () => {
        expect(getTranslation(family, key, { count: 3 })).toBe('My translations');
    });

    test('should get a specific count translation if available', () => {
        expect(getTranslation(family, key, { count: 2 })).toBe('My two translations');
    });

    test('should get the default translation if count is not greater than 1', () => {
        expect(getTranslation(family, key, { count: 1 })).toBe('My translation');
        expect(getTranslation(family, key, { count: 0 })).toBe('My translation');
        expect(getTranslation(family, key, { count: -1 })).toBe('My translation');
    });

    test('should get the default translation if count is not provided', () => {
        expect(getTranslation(family, key)).toBe('My translation');
    });

    test('should only probe the plural form for a count greater than one', () => {
        const probedKeys: string[] = [];

        getTranslation(probedKey => {
            probedKeys.push(probedKey);
            return null;
        }, key);

        expect(probedKeys).toEqual(['myTranslation__0', 'myTranslation']);
    });

    test('should return null when the resolver has no template for the key', () => {
        expect(getTranslation(() => null, key)).toBe(null);
    });
});

describe('formatCustomTranslations()', () => {
    test('should work when no custom translations are passed', () => {
        expect(formatCustomTranslations({}, defaultSupportedLocales)).toEqual({});
        expect(formatCustomTranslations(undefined, defaultSupportedLocales)).toEqual({});
    });

    test('should work when custom translations are already in the defaultSupportedLocales', () => {
        const customTranslations = {
            'en-US': {
                [translationKey]: 'customString',
            },
        };

        expect(formatCustomTranslations(customTranslations, defaultSupportedLocales)).toEqual(customTranslations);
    });

    test('should work when custom translations contain a partial ', () => {
        const customTranslations = {
            en: {
                [translationKey]: 'customString',
            },
        };

        const expectedCustomTranslations = {
            'en-US': {
                [translationKey]: 'customString',
            },
        };

        expect(formatCustomTranslations(customTranslations, defaultSupportedLocales)).toEqual(expectedCustomTranslations);
    });

    test('should format new locales', () => {
        const customTranslations = {
            'es-ar': {
                [translationKey]: 'customString',
            },
        };

        const expectedCustomTranslations = {
            'es-AR': {
                [translationKey]: 'customString',
            },
        };

        expect(formatCustomTranslations(customTranslations, defaultSupportedLocales)).toEqual(expectedCustomTranslations);
    });

    test('should format new locales', () => {
        const customTranslations = {
            'ca-ca': {
                [translationKey]: 'customString',
            },
        };

        const expectedCustomTranslations = {
            'ca-CA': {
                [translationKey]: 'customString',
            },
        };

        expect(formatCustomTranslations(customTranslations, defaultSupportedLocales)).toEqual(expectedCustomTranslations);
    });

    test('should format new partial locales if properly added in the defaultSupportedLocales', () => {
        const customTranslations = {
            ca: {
                [translationKey]: 'customString',
            },
        };
        const defaultSupportedLocales = ['es-ES' as const, 'ca-CA' as const];
        const expectedCustomTranslations = {
            'ca-CA': {
                [translationKey]: 'customString',
            },
        };

        expect(formatCustomTranslations(customTranslations, defaultSupportedLocales)).toEqual(expectedCustomTranslations);
    });
});

describe('loadTranslations()', () => {
    test('should request the catalog of the locale matched against the supported locales', async () => {
        const requestedLocales: string[] = [];

        const translations = await loadTranslations('es-AR', locale => {
            requestedLocales.push(locale);
            return Promise.resolve(translationsDevAssets['es-ES']!);
        });

        expect(requestedLocales).toEqual(['es-ES']);
        expect(translations).toBe(await translationsDevAssets['es-ES']);
    });

    test('should request the fallback locale when the locale cannot be matched', async () => {
        const requestedLocales: string[] = [];

        await loadTranslations('xx-XX', locale => {
            requestedLocales.push(locale);
            return Promise.resolve(null);
        });

        expect(requestedLocales).toEqual(['en-US']);
    });

    test('should resolve null when the locale has no catalog source', async () => {
        await expect(loadTranslations('de-DE', () => Promise.resolve(null))).resolves.toBe(null);
    });
});
