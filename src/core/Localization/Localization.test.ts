import Localization from './Localization';
import { describe, expect, test } from 'vitest';
import { es_ES, TranslationKey } from '../../core';

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
    });
});
