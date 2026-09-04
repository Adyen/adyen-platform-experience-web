import { describe, expect, test } from 'vitest';
import { V2_ROUTED_BENTO_TRANSLATION_KEYS, V2_SDK_BENTO_FALLBACK_TRANSLATION_KEYS, V2_TRANSLATION_ROUTES } from './generated';
import { compileTranslationTemplate, parseV1TranslationTemplate } from './message';
import { V2_SDK_BENTO_DEFAULT_TRANSLATIONS, V2_SDK_DEFAULT_TRANSLATIONS } from './sdkTranslations';

describe('Bento translation routes', () => {
    test('every routed Bento key maps to a public route with a bento target', () => {
        const routedKeys = new Set<string>();

        for (const route of V2_TRANSLATION_ROUTES) {
            for (const target of route.targets) {
                if (target.kind === 'bento') {
                    routedKeys.add(target.key);
                }
            }
        }

        expect(routedKeys.size).toBe(V2_ROUTED_BENTO_TRANSLATION_KEYS.length);

        for (const key of V2_ROUTED_BENTO_TRANSLATION_KEYS) {
            expect(routedKeys.has(key), `${key} is listed as routed but has no bento route`).toBe(true);
        }
    });

    test('every Bento-routed public key has an SDK default template that compiles for Bento', () => {
        const publicKeysWithBentoTargets = new Set<string>();

        for (const route of V2_TRANSLATION_ROUTES) {
            if (route.targets.some(target => target.kind === 'bento')) {
                publicKeysWithBentoTargets.add(route.publicKey);
            }
        }

        expect(publicKeysWithBentoTargets.size).toBeGreaterThan(0);

        for (const publicKey of publicKeysWithBentoTargets) {
            const template = V2_SDK_DEFAULT_TRANSLATIONS[publicKey];
            expect(template, `${publicKey} must have an SDK default template`).toBeTypeOf('string');
            expect(() => compileTranslationTemplate(parseV1TranslationTemplate(template as string), 'bento')).not.toThrow();
        }
    });

    test('SDK Bento fallback keys match the authored fallback file and compile for Bento', () => {
        expect(V2_SDK_BENTO_FALLBACK_TRANSLATION_KEYS).toEqual(Object.keys(V2_SDK_BENTO_DEFAULT_TRANSLATIONS).sort());

        for (const key of V2_SDK_BENTO_FALLBACK_TRANSLATION_KEYS) {
            expect(key.startsWith('bento.'), `${key} must be a universal Bento key`).toBe(true);
            const template = V2_SDK_BENTO_DEFAULT_TRANSLATIONS[key];
            expect(template, `${key} must have SDK fallback copy`).toBeTypeOf('string');
            expect(() => compileTranslationTemplate(parseV1TranslationTemplate(template as string), 'bento')).not.toThrow();
        }
    });
});
