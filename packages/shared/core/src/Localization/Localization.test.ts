import Localization from './Localization';
import { describe, expect, test, vi } from 'vitest';
import { es_ES, type TranslationKey } from '../translations';
import sdkGermanTranslations from '../../../../sdk/translations/de-DE.json' with { type: 'json' };
import sdkEnglishTranslations from '../../../../sdk/translations/en-US.json' with { type: 'json' };

describe('Localization', () => {
    const translationKey = 'abc' as TranslationKey;

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

        describe('backward compatibility with swapConfig', () => {
            test('returns custom translation when user provides old key that maps to new key', async () => {
                const lang = new Localization('en-US');

                // User provides translation using the old key "contactSupport"
                lang.customTranslations = {
                    'en-US': {
                        contactSupport: 'Call us now',
                    } as unknown as Record<TranslationKey, string>,
                };

                await lang.ready;

                const result = lang.get('capital.common.actions.contactSupport' as TranslationKey);
                expect(result).toBe('Call us now');
            });

            test('returns translation normally when new key is used', async () => {
                const lang = new Localization('en-US');

                // User provides translation using the new key
                lang.customTranslations = {
                    'en-US': {
                        'capital.common.actions.contactSupport': 'Get help now',
                    },
                };

                await lang.ready;

                const result = lang.get('capital.common.actions.contactSupport' as TranslationKey);
                expect(result).toBe('Get help now');
            });

            test('returns translation normally if custom translation is missing', async () => {
                const lang = new Localization('en-US');
                await lang.ready;

                const result = lang.get('capital.common.actions.contactSupport' as TranslationKey);
                expect(result).toBe('Contact support');
            });

            test('prioritizes new key custom translation over old key custom translation', async () => {
                const lang = new Localization('en-US');

                lang.customTranslations = {
                    'en-US': {
                        'capital.common.actions.contactSupport': 'New Translation',
                        contactSupport: 'Old Translation',
                    } as unknown as Record<TranslationKey, string>,
                };

                await lang.ready;

                const result = lang.get('capital.common.actions.contactSupport' as TranslationKey);
                expect(result).toBe('New Translation');
            });

            test('warns when falling back to a deprecated key', async () => {
                const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                const lang = new Localization('en-US');

                lang.customTranslations = {
                    'en-US': {
                        contactSupport: 'Call us now',
                    } as unknown as Record<TranslationKey, string>,
                };

                await lang.ready;

                lang.get('capital.common.actions.contactSupport' as TranslationKey);

                expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Deprecated translation key detected: "contactSupport"'));

                consoleWarnSpy.mockRestore();
            });

            test('does not check swapConfig for 1:1 mappings', async () => {
                const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                const lang = new Localization('en-US');

                // "capital.actionNeeded" maps to itself in swapConfig (1:1 mapping)
                lang.customTranslations = {
                    'en-US': {
                        ['capital.actionNeeded' as TranslationKey]: 'Action Required',
                    },
                };

                await lang.ready;

                const result = lang.get('capital.actionNeeded' as TranslationKey);

                // Should return the custom translation
                expect(result).toBe('Action Required');

                // Should not emit deprecation warning for 1:1 mappings
                expect(consoleWarnSpy).not.toHaveBeenCalled();

                consoleWarnSpy.mockRestore();
            });
        });
    });

    describe('SDK translation sources', () => {
        test('loads a V2 locale catalog and falls back to its English catalog', async () => {
            const localization = new Localization('de-DE', undefined, '', '', {
                defaultTranslations: sdkEnglishTranslations,
                localeTranslations: {
                    'de-DE': Promise.resolve(sdkGermanTranslations),
                    'en-US': Promise.resolve(sdkEnglishTranslations),
                },
            });

            await localization.ready;

            expect(localization.get('transactions.errors.updateFilters' as TranslationKey)).toBe(
                sdkGermanTranslations['transactions.errors.updateFilters']
            );
            expect(localization.get('capital.common.errors.unsupportedRegion')).toBe(
                sdkGermanTranslations['capital.common.errors.unsupportedRegion']
            );
        });
    });
});
