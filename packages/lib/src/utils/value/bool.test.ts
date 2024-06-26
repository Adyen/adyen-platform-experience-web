import { describe, expect, test } from 'vitest';
import { boolify, boolOrFalse, boolOrTrue, falsify, truthify } from './bool';

const NON_BOOL_FALSY_VALUES = [-0, 0, 0n, NaN, null, undefined, ''] as const;
const NON_BOOL_TRUTHY_VALUES = [[], {}, () => {}, /\\/, Symbol(), 1, 100n, 'true', 'false'] as const;

describe('boolify', () => {
    test('should behave as identity function for boolean values', () => {
        expect(boolify(false)).toBe(false);
        expect(boolify(true)).toBe(true);
    });

    test('should behave like the global `Boolean` function if called with same arguments', () => {
        expect(boolify()).toBe(false);

        NON_BOOL_FALSY_VALUES.forEach(value => {
            expect(boolify(value)).toBe(false);
        });

        NON_BOOL_TRUTHY_VALUES.forEach(value => {
            expect(boolify(value)).toBe(true);
        });
    });

    test('should return the boolified fallback for non-boolean values', () => {
        [...NON_BOOL_FALSY_VALUES, ...NON_BOOL_TRUTHY_VALUES].forEach(value => {
            expect(boolify(value, false)).toBe(false);
            expect(boolify(value, true)).toBe(true);
            expect(boolify(value, 'false')).toBe(true); // because Boolean('false') => true
            expect(boolify(value, 'null')).toBe(true); // because Boolean('null') => true
            expect(boolify(value, null)).toBe(false); // because Boolean(null) => false
            expect(boolify(value, 0)).toBe(false); // because Boolean(0) => false
        });
    });
});

describe('boolOrFalse', () => {
    test('should behave as identity function for boolean values', () => {
        expect(boolOrFalse(false)).toBe(false);
        expect(boolOrFalse(true)).toBe(true);
    });

    test('should return `false` for non-boolean values', () => {
        expect(boolOrFalse()).toBe(false);

        [...NON_BOOL_FALSY_VALUES, ...NON_BOOL_TRUTHY_VALUES].forEach(value => {
            expect(boolOrFalse(value)).toBe(false);
        });
    });
});

describe('boolOrTrue', () => {
    test('should behave as identity function for boolean values', () => {
        expect(boolOrTrue(false)).toBe(false);
        expect(boolOrTrue(true)).toBe(true);
    });

    test('should return `true` for non-boolean values', () => {
        expect(boolOrTrue()).toBe(true);

        [...NON_BOOL_FALSY_VALUES, ...NON_BOOL_TRUTHY_VALUES].forEach(value => {
            expect(boolOrTrue(value)).toBe(true);
        });
    });
});

describe('falsify', () => {
    test('should always return `false`', () => {
        expect(falsify()).toBe(false);
        expect(falsify(false)).toBe(false);
        expect(falsify(true)).toBe(false);

        [...NON_BOOL_FALSY_VALUES, ...NON_BOOL_TRUTHY_VALUES].forEach(value => {
            expect(falsify(value)).toBe(false);
        });
    });
});

describe('truthify', () => {
    test('should always return `true`', () => {
        expect(truthify()).toBe(true);
        expect(truthify(false)).toBe(true);
        expect(truthify(true)).toBe(true);

        [...NON_BOOL_FALSY_VALUES, ...NON_BOOL_TRUTHY_VALUES].forEach(value => {
            expect(truthify(value)).toBe(true);
        });
    });
});
