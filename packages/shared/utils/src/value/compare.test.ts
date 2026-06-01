import { describe, expect, test } from 'vitest';
import { sameValue } from './compare';

describe('sameValue', () => {
    test('should return `true` if both arguments are NaN (unlike strict equality)', () => {
        const map = new Map([
            [Number.NaN, [NaN, Number.NaN]],
            [NaN, [NaN]],
        ]);

        map.forEach((nans, first_nan) => {
            nans.forEach(second_nan => {
                expect(first_nan === second_nan).toBe(false);
                expect(sameValue(first_nan, second_nan)).toBe(true);
            });
        });
    });

    test('should return `true` if both arguments are 0 (regardless of the sign)', () => {
        const map = new Map([
            [-0, [0, -0]],
            [0, [0]],
        ]);

        map.forEach((zeros, first_zero) => {
            zeros.forEach(second_zero => {
                expect(first_zero === second_zero).toBe(true);
                expect(sameValue(first_zero, second_zero)).toBe(true);
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

        map.forEach((second_value, first_value) => {
            expect(first_value === second_value).toBe(false);
            expect(sameValue(first_value, second_value)).toBe(false);
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
