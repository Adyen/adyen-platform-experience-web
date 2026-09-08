import Localization from './Localization';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { es_ES, type TranslationKey } from '../translations';
import sdkGermanTranslations from '../../../../sdk/translations/de-DE.json' with { type: 'json' };
import sdkEnglishTranslations from '../../../../sdk/translations/en-US.json' with { type: 'json' };

describe('Localization', () => {
    const translationKey = 'abc' as TranslationKey;

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    describe('constructor', () => {
        test('sets up locale and customTranslations', () => {
            const lang = new Localization('es-ES', [es_ES]);

            lang.customTranslations = {
                'es-ES': { [translationKey]: 'es' },
            };

            lang.ready.then(() => {
                expect(lang.locale).toBe('es-ES');
                expect(lang.customTranslations['es-ES']).toBeDefined();
            });
        });

        test('sets up locale without country code and customTranslations without countryCode', () => {
            const lang = new Localization('es', [es_ES]);

            lang.customTranslations = {
                es: { [translationKey]: 'es' },
            };

            lang.ready.then(() => {
                expect(lang.locale).toBe('es-ES');
                expect(lang.customTranslations['es-ES']).toBeDefined();
            });
        });

        test('sets up a custom locale and customTranslations', () => {
            const lang = new Localization('ca-CA');

            lang.customTranslations = {
                'ca-CA': { [translationKey]: 'ca' },
            };

            lang.ready.then(() => {
                expect(lang.locale).toBe('ca-CA');
                expect(lang.customTranslations['ca-CA']).toBeDefined();
            });
        });

        test('sets up a custom locale without countryCode and customTranslations', () => {
            const lang = new Localization('ca');

            lang.customTranslations = {
                'ca-CA': { [translationKey]: 'ca' },
            };

            lang.ready.then(() => {
                expect(lang.locale).toBe('ca-CA');
                expect(lang.customTranslations['ca-CA']).toBeDefined();
            });
        });

        test('falls back to FALLBACK_LOCALE and removes customTranslations that do not match a language/language_country code', () => {
            const lang = new Localization('FAKE');

            lang.customTranslations = {
                FAKE: { [translationKey]: 'ca' },
            };

            lang.ready.then(() => {
                expect(lang.locale).toBe('en-US');
                expect(lang.customTranslations).toEqual({});
            });
        });
    });

    describe('get', () => {
        test('gets a string even if it is empty', () => {
            const lang = new Localization('en-US');

            lang.customTranslations = {
                'en-US': { [translationKey]: '' },
            };

            lang.ready.then(() => {
                expect(lang.get(translationKey)).toBe(translationKey);
            });
        });
    });

    describe('SDK translation sources', () => {
        const sources = {
            defaultTranslations: sdkEnglishTranslations,
            localeTranslations: {
                'de-DE': Promise.resolve(sdkGermanTranslations),
                'en-US': Promise.resolve(sdkEnglishTranslations),
            },
        };

        test('loads a V2 locale catalog and falls back to its English catalog', async () => {
            const localization = new Localization('de-DE', undefined, '', '', sources);

            await localization.ready;

            expect(localization.get('transactions.common.errors.updateFilters' as TranslationKey)).toBe(
                sdkGermanTranslations['transactions.common.errors.updateFilters']
            );
            expect(localization.get('capital.common.errors.unsupportedRegion')).toBe(
                sdkGermanTranslations['capital.common.errors.unsupportedRegion']
            );
        });

        test('loads SDK locale catalogs from the CDN before bundled catalogs', async () => {
            vi.stubEnv('VITE_LOCAL_ASSETS', '');
            const fetch = vi.fn().mockResolvedValue(
                new Response(JSON.stringify({ 'transactions.common.errors.updateFilters': 'CDN translation' }), {
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            vi.stubGlobal('fetch', fetch);

            const localization = new Localization('de-DE', undefined, 'https://cdn.example/translations', '', sources);

            await localization.ready;

            expect(String(fetch.mock.calls[0]?.[0])).toBe('https://cdn.example/translations/de-DE.json');
            expect(localization.get('transactions.common.errors.updateFilters' as TranslationKey)).toBe('CDN translation');
        });

        test('falls back to bundled SDK locale catalogs when CDN loading fails', async () => {
            vi.stubEnv('VITE_LOCAL_ASSETS', '');
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CDN unavailable')));

            const localization = new Localization('de-DE', undefined, 'https://cdn.example/translations', '', sources);

            await localization.ready;

            expect(localization.get('transactions.common.errors.updateFilters' as TranslationKey)).toBe(
                sdkGermanTranslations['transactions.common.errors.updateFilters']
            );
        });
    });
});
