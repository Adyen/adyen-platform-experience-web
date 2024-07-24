import { describe, expect, test } from 'vitest';
import { clamp, isBitSafeInteger, isInfinity, mid, mod } from './number';

describe('clamp', () => {
    test('should return specified number if contained within the specified range', () => {
        [-1, -0.9999, -0.5, -0, 0, 0.875, 0.9999, 1].forEach(number => {
            expect(clamp(-1, number, 1)).toBe(number);
        });
    });

    test('should not return number lower than the minimum bound of the specified range', () => {
        const VALUES = [100, 99.9999, 0, -100];
        VALUES.forEach(number => expect(clamp(100, number, Infinity)).toBe(100)); // `min` < `max`
        VALUES.forEach(number => expect(clamp(100, number, -Infinity)).toBe(number)); // `min` > `max`
    });

    test('should not return number higher than the maximum bound of the specified range', () => {
        const VALUES = [100, 100.0001, 1e3, 123_000];
        VALUES.forEach(number => expect(clamp(-Infinity, number, 100)).toBe(100)); // `min` < `max`
        VALUES.forEach(number => expect(clamp(Infinity, number, 100)).toBe(number)); // `min` > `max`
    });
});

describe('isBitSafeInteger', () => {
    const MAX_INTEGER = 2147483647 as const;
    const MIN_INTEGER = -2147483648 as const;

    const _randomBitSafeInteger = () => MIN_INTEGER + Math.ceil(Math.random() * 0xffff_fffe);

    const _randomBitSafeIntegers = (length: number) => {
        const random = new Set<number>();

        for (let i = 0; i < length; i++) {
            const randomInteger = _randomBitSafeInteger();
            random.has(randomInteger) ? --i : random.add(randomInteger);
        }

        return random;
    };

    test('should return `true` for integers within bit-safe range', () => {
        expect(isBitSafeInteger(MAX_INTEGER)).toBe(true);
        expect(isBitSafeInteger(MIN_INTEGER)).toBe(true);

        // random integers (within bit-safe range)
        _randomBitSafeIntegers(50).forEach(int => {
            expect(isBitSafeInteger(int)).toBe(true);
        });
    });

    test('should return `false` for integers out of bit-safe range', () => {
        expect(isBitSafeInteger(MAX_INTEGER + 1)).toBe(false);
        expect(isBitSafeInteger(MIN_INTEGER - 1)).toBe(false);

        // random integers (out of bit-safe range)
        _randomBitSafeIntegers(50).forEach(int => {
            expect(isBitSafeInteger(int + 0xffff_ffff)).toBe(false);
            expect(isBitSafeInteger(int - 0xffff_ffff)).toBe(false);
        });
    });

    test('should return `false` for non-number and non-integer values', () => {
        // no argument
        expect(isBitSafeInteger()).toBe(false);

        // non-integer values
        [-Infinity, Infinity, NaN, -5.455_376_587_3e5, 124_473_115.455, Number.EPSILON, Math.E, Math.PI].forEach(number => {
            expect(isBitSafeInteger(number)).toBe(false);
            expect(isBitSafeInteger(`${number}`)).toBe(false);
        });

        // non-number values
        ['false', 'true', '', false, true, null, undefined, Symbol(), [], {}, /\\/, () => {}].forEach(value =>
            expect(isBitSafeInteger(value)).toBe(false)
        );
    });
});

describe('isInfinity', () => {
    test('should return `true` for only the global `Infinity` values', () => {
        [-Infinity, Infinity].forEach(value => {
            expect(isInfinity(value)).toBe(true);
            expect(isInfinity(`${value}`)).toBe(false);
        });

        [0, -0, NaN, 0b1010011, 0o123, 0x53, 83, 1e3, -5.455e3, -5.455, 100_344_344, 1 << 31, Math.PI].forEach(number => {
            expect(isInfinity(number)).toBe(false);
            expect(isInfinity(`${number}`)).toBe(false);
        });

        // no argument
        expect(isInfinity()).toBe(false);
    });
});

describe('mid', () => {
    test('should return the floored median integer between two integers', () => {
        const pairs: [number, number, number][] = [
            [8, 12, 10],
            [12, 8, 10],
            [1, 24, 12],
            [24, 1, 12],
            [-13, 46, 16],
            [46, -13, 16],
        ];

        pairs.forEach(([lower, higher, middle]) => {
            expect(mid(lower, higher)).toBe(middle);
        });
    });

    test('should throw an error for non-integer value(s)', async () => {
        const pairs: [number, number][] = [
            [-12, 15.875],
            [-12.465, 15.875],
            [-48.12, -11],
            [-48.12, -11.56],
            [100, -1.5],
            [100.346, -1.5],
        ];

        pairs.forEach(([lower, higher]) => {
            expect(() => mid(lower, higher)).toThrowError();
        });
    });
});

describe('mod', () => {
    test('should behave just like the remainder operator for integers with same sign', () => {
        const pairs: [number, number, number][] = [
            [12, 0, NaN],
            [0, 12, 0],
            [5, 3, 2],
            [545, 7, 6],
            [954, 29, 26],
            [1200, 25, 0],
        ];

        pairs.forEach(([number, modulo, result]) => {
            // both positive
            expect(number % modulo).toBe(result);
            expect(mod(number, modulo)).toBe(result);

            // both negative
            expect(-number % -modulo).toBe(-result);
            expect(mod(-number, -modulo)).toBe(-result);
        });
    });

    test('should always return result with same sign as modulo (unlike the remainder operator)', () => {
        const pairs: [number, number, number][] = [
            [-5, 3, 1],
            [5, -3, -1],
            [-545, 7, 1],
            [545, -7, -1],
            [-954, 29, 3],
            [954, -29, -3],
        ];

        pairs.forEach(([number, modulo, result]) => {
            expect(number % modulo).toBe(result - modulo); // remainder (%) result has same sign as number (always)
            expect(mod(number, modulo)).toBe(result); // `mod()` result has same sign as modulo (always)
            expect(mod(number, modulo)).not.toBe(number % modulo);
        });
    });
});
