import { describe, expect, test } from 'vitest';
import { capitalize } from './string';

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
