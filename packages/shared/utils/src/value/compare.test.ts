import { describe, expect, test } from 'vitest';
import { isShallowEqual, sameValue } from './compare';

describe('sameValue', () => {
    test('should return `true` if both arguments are NaN (unlike strict equality)', () => {
        const map = new Map([
            [Number.NaN, [NaN, Number.NaN]],
            [NaN, [NaN]],
        ]);

        map.forEach((nans, firstNan) => {
            nans.forEach(secondNan => {
                expect(firstNan === secondNan).toBe(false);
                expect(sameValue(firstNan, secondNan)).toBe(true);
            });
        });
    });

    test('should return `true` if both arguments are 0 (regardless of the sign)', () => {
        const map = new Map([
            [-0, [0, -0]],
            [0, [0]],
        ]);

        map.forEach((zeros, firstZero) => {
            zeros.forEach(secondZero => {
                expect(firstZero === secondZero).toBe(true);
                expect(sameValue(firstZero, secondZero)).toBe(true);
            });
        });
    });

    test('should behave like strict equality comparison for unique object references', () => {
        const map = new Map<any, any>([
            [[], []],
            [{}, {}],
            [() => {}, () => {}],
            [new String(''), new String('')],
            [new Date(), new Date()],
        ]);

        map.forEach((secondValue, firstValue) => {
            expect(firstValue === secondValue).toBe(false);
            expect(sameValue(firstValue, secondValue)).toBe(false);
        });
    });

    test('should behave like strict equality comparison for same object references', () => {
        ([[], {}, () => {}, new String(''), new Date()] as const).forEach(value => {
            expect(value === value).toBe(true);
            expect(sameValue(value, value)).toBe(true);
        });
    });

    test('should behave like strict equality comparison for same primitive values', () => {
        ([-0, 0, 0n, 1, -100n, false, true, null, undefined, Symbol(), '', 'true', 'false'] as const).forEach(value => {
            expect(value === value).toBe(true);
            expect(sameValue(value, value)).toBe(true);
        });
    });
});

describe('isShallowEqual', () => {
    test('returns true for the same object or two objects with equal primitive properties', () => {
        const value = { illustrations: 'hidden' as const, titles: 'visible' as const };

        expect(isShallowEqual(value, value)).toBe(true);
        expect(isShallowEqual(value, { illustrations: 'hidden', titles: 'visible' })).toBe(true);
    });

    test('returns false when a property value or property name differs', () => {
        expect(isShallowEqual({ illustrations: 'hidden' }, { illustrations: 'visible' })).toBe(false);
        expect(isShallowEqual({ illustrations: undefined }, { titles: undefined })).toBe(false);
    });

    test('compares nested objects by reference', () => {
        const nested = { dataGrid: 'condensed' };

        expect(isShallowEqual({ density: nested }, { density: nested })).toBe(true);
        expect(isShallowEqual({ density: nested }, { density: { dataGrid: 'condensed' } })).toBe(false);
    });

    test('handles nullish values', () => {
        expect(isShallowEqual(undefined, undefined)).toBe(true);
        expect(isShallowEqual(null, null)).toBe(true);
        expect(isShallowEqual(undefined, {})).toBe(false);
    });
});
