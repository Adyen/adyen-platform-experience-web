import { Language } from './Language';
import { describe, expect, test } from 'vitest';

describe('Language', () => {
    describe('constructor', () => {
        test('sets up locale and customTranslations', () => {
            const customTranslations = {
                'es-ES': {
                    account: 'es',
                },
            };

            const lang = new Language('es-ES', customTranslations);

            expect(lang.locale).toBe('es-ES');
            expect(lang.customTranslations['es-ES']).toBeDefined();
        });

        test('sets up locale without country code and customTranslations without countryCode', () => {
            const customTranslations = {
                es: {
                    paymentId: 'es',
                },
            };

            const lang = new Language('es', customTranslations);

            expect(lang.locale).toBe('es-ES');
            expect(lang.customTranslations['es-ES']).toBeDefined();
        });

        test('sets up a custom locale and customTranslations', () => {
            const customTranslations = {
                'ca-CA': {
                    paymentId: 'ca',
                },
            };

            const lang = new Language('ca-CA', customTranslations);

            expect(lang.locale).toBe('ca-CA');
            expect(lang.customTranslations['ca-CA']).toBeDefined();
        });

        test('sets up a custom locale without countryCode and customTranslations', () => {
            const customTranslations = {
                'ca-CA': {
                    paymentId: 'ca',
                },
            };

            const lang = new Language('ca', customTranslations);

            expect(lang.locale).toBe('ca-CA');
            expect(lang.customTranslations['ca-CA']).toBeDefined();
        });

        test.skip('falls back to FALLBACK_LOCALE and removes customTranslations that do not match a language/language_country code', () => {
            const customTranslations = {
                FAKE: {
                    paymentId: 'ca',
                },
            };

            const lang = new Language('FAKE', customTranslations);

            expect(lang.locale).toBe('en-US');
            expect(lang.customTranslations).toEqual({});
        });
    });

    describe('get', () => {
        test('gets a string even if it is empty', () => {
            const lang = new Language('en-US', {
                'en-US': {
                    paymentId: 'customPaymentId',
                },
            });

            lang.loaded.then(i18n => {
                expect(i18n.get('paymentId')).toBe('customPaymentId');
            });
        });
    });
});
