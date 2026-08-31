import { describe, expect, test } from 'vitest';
import { canonicalizeTranslationLocale, translationLocalesMatch } from './locale';

describe('canonicalizeTranslationLocale', () => {
    test.each([
        ['en_us', 'en-US'],
        ['FR-fr', 'fr-FR'],
        ['zh-hant-tw', 'zh-Hant-TW'],
        ['fr', 'fr'],
    ])('canonicalizes %s without selecting a related locale', (input, expected) => {
        expect(canonicalizeTranslationLocale(input)).toBe(expected);
    });

    test.each(['', 'not a locale', 'en--US'])('rejects invalid locale %s', input => {
        expect(canonicalizeTranslationLocale(input)).toBeUndefined();
    });

    test('matches only canonical full tags exactly', () => {
        expect(translationLocalesMatch('fr_fr', 'fr-FR')).toBe(true);
        expect(translationLocalesMatch('fr', 'fr-FR')).toBe(false);
        expect(translationLocalesMatch('fr-CA', 'fr-FR')).toBe(false);
    });
});
