import { describe, expect, test } from 'vitest';
import { capitalize, isEmptyString } from './string';

describe('capitalize', () => {
    test('should transform only the first character of string to uppercase (if applicable)', () => {
        const pairs: [string, string][] = [
            ['', ''],
            ['123', '123'],
            ['_abc', '_abc'],
            ['abc', 'Abc'],
            ['aBc', 'ABc'],
            ['Abc', 'Abc'],
            ['ABC', 'ABC'],
        ];

        pairs.forEach(([string, capitalizedString]) => {
            expect(capitalize(string)).toBe(capitalizedString);
        });
    });

    test('should behave as identity function for non-string values', () => {
        [0, 1, NaN, false, true, null, undefined, Symbol(), [], {}, /\\/, () => {}].forEach(value => expect(capitalize(value as any)).toBe(value));
    });
});

describe('isEmptyString', () => {
    test('should return `true` for empty string and string containing only spaces', () => {
        expect(isEmptyString('')).toBe(true);
        expect(isEmptyString(' ')).toBe(true);
        expect(isEmptyString(`    `)).toBe(true);
    });

    test('should return `true` for nullish values', () => {
        expect(isEmptyString()).toBe(true);
        expect(isEmptyString(null!)).toBe(true);
        expect(isEmptyString(undefined)).toBe(true);
    });

    test('should return `false` for every other value or non-empty string', () => {
        [0, 1, NaN, 'false', 'true', false, true, Symbol(), [], {}, /\\/, () => {}].forEach(value => expect(isEmptyString(value as any)).toBe(false));
    });
});
