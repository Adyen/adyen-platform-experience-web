import Localization from './Localization';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { TranslationKey } from '../translations';
import sdkGermanTranslations from '../../../../sdk/translations/de-DE.json' with { type: 'json' };
import sdkEnglishTranslations from '../../../../sdk/translations/en-US.json' with { type: 'json' };
import { SUPPORTED_LOCALES } from './constants/localization';

describe('Localization', () => {
    const translationKey = 'abc' as TranslationKey;

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    describe('constructor', () => {
        test('initializes supportedLocales as a copy of SUPPORTED_LOCALES', () => {
            const lang = new Localization();

            expect(lang.supportedLocales).toEqual(SUPPORTED_LOCALES);
            expect(lang.supportedLocales).not.toBe(SUPPORTED_LOCALES);
        });

        test('sets up locale and customTranslations', async () => {
            const lang = new Localization('es-ES');

            lang.customTranslations = {
                'es-ES': { [translationKey]: 'es' },
            };

            await lang.ready;

            expect(lang.locale).toBe('es-ES');
            expect(lang.customTranslations['es-ES']).toBeDefined();
        });

        test('sets up locale without country code and customTranslations without countryCode', async () => {
            const lang = new Localization('es');

            lang.customTranslations = {
                es: { [translationKey]: 'es' },
            };

            await lang.ready;

            expect(lang.locale).toBe('es-ES');
            expect(lang.customTranslations['es-ES']).toBeDefined();
        });

        test('sets up a custom locale and customTranslations', async () => {
            const lang = new Localization('ca-CA');

            lang.customTranslations = {
                'ca-CA': { [translationKey]: 'ca' },
            };

            await lang.ready;

            expect(lang.locale).toBe('ca-CA');
            expect(lang.customTranslations['ca-CA']).toBeDefined();
        });

        test('sets up a custom locale without countryCode and customTranslations', async () => {
            const lang = new Localization('ca');

            lang.customTranslations = {
                'ca-CA': { [translationKey]: 'ca' },
            };

            await lang.ready;

            expect(lang.locale).toBe('ca-CA');
            expect(lang.customTranslations['ca-CA']).toBeDefined();
        });

        test('falls back to FALLBACK_LOCALE and removes customTranslations that do not match a language/language_country code', async () => {
            const lang = new Localization('FAKE');

            lang.customTranslations = {
                FAKE: { [translationKey]: 'ca' },
            };

            await lang.ready;

            expect(lang.locale).toBe('en-US');
            expect(lang.customTranslations).toEqual({});
        });
    });

    describe('get', () => {
        test('gets a string even if it is empty', async () => {
            const lang = new Localization('en-US');

            lang.customTranslations = {
                'en-US': { [translationKey]: '' },
            };

            await lang.ready;

            expect(lang.get(translationKey)).toBe(translationKey);
        });
    });

    describe('SDK translation sources', () => {
        test('loads SDK locale catalog and falls back to English for untranslated keys', async () => {
            const englishFallbackKey = 'transactions.common.errors.updateFilters';
            const translationKey = 'capital.common.errors.unsupportedRegion';
            const germanTranslationsWithoutFallbackKey: Record<string, string> = { ...sdkGermanTranslations };

            delete germanTranslationsWithoutFallbackKey[englishFallbackKey];

            const localization = new Localization('de-DE', '', {
                defaultTranslations: sdkEnglishTranslations,
                localeTranslations: {
                    'de-DE': Promise.resolve(germanTranslationsWithoutFallbackKey),
                    'en-US': Promise.resolve(sdkEnglishTranslations),
                },
            });

            await localization.ready;

            expect(localization.get(englishFallbackKey)).toBe(sdkEnglishTranslations[englishFallbackKey]);
            expect(localization.get(translationKey)).toBe(sdkGermanTranslations[translationKey]);
        });

        test('loads SDK locale catalogs from the CDN before bundled catalogs', async () => {
            vi.stubEnv('VITE_LOCAL_ASSETS', '');
            const fetch = vi.fn().mockResolvedValue(
                new Response(JSON.stringify({ 'transactions.common.errors.updateFilters': 'CDN translation' }), {
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            vi.stubGlobal('fetch', fetch);

            const localization = new Localization('de-DE', 'https://cdn.example/translations', {
                defaultTranslations: sdkEnglishTranslations,
                localeTranslations: {
                    'de-DE': Promise.resolve(sdkGermanTranslations),
                    'en-US': Promise.resolve(sdkEnglishTranslations),
                },
            });

            await localization.ready;

            expect(String(fetch.mock.calls[0]?.[0])).toBe('https://cdn.example/translations/de-DE.json');
            expect(localization.get('transactions.common.errors.updateFilters' as TranslationKey)).toBe('CDN translation');
        });

        test('falls back to bundled SDK locale catalogs when CDN loading fails', async () => {
            vi.stubEnv('VITE_LOCAL_ASSETS', '');
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CDN unavailable')));

            const localization = new Localization('de-DE', 'https://cdn.example/translations', {
                defaultTranslations: sdkEnglishTranslations,
                localeTranslations: {
                    'de-DE': Promise.resolve(sdkGermanTranslations),
                    'en-US': Promise.resolve(sdkEnglishTranslations),
                },
            });

            await localization.ready;

            expect(localization.get('transactions.common.errors.updateFilters' as TranslationKey)).toBe(
                sdkGermanTranslations['transactions.common.errors.updateFilters']
            );
        });
    });
});
