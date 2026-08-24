import { describe, expect, test, vi } from 'vitest';
import {
    calculateMonthsFromDays,
    calculateMonthsAndDaysFromDays,
    getPercentageOfRange,
    getRelativeToDefault,
    calculateTimestampAfterDays,
} from './generic';

describe('calculateMonthsFromDays', () => {
    test('returns months from provided number of days', () => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-15T12:00:00.000Z');
        expect(calculateMonthsFromDays(31)).toBe(2);
    });

    test('returns 0 for zero days', () => {
        expect(calculateMonthsFromDays(0)).toBe(0);
    });

    test('returns 1 for an exact 30-day period', () => {
        expect(calculateMonthsFromDays(30)).toBe(1);
    });
});

describe('calculateMonthsAndDaysFromDays', () => {
    test('returns months and remaining days from provided number of days', () => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-15T12:00:00.000Z');
        expect(calculateMonthsAndDaysFromDays(91)).toEqual({ months: 3, remainingDays: 1 });
    });

    test('returns no remaining days for exact months', () => {
        expect(calculateMonthsAndDaysFromDays(90)).toEqual({ months: 3, remainingDays: 0 });
    });
});

describe('calculateTimestampAfterDays', () => {
    test('calculates the timestamp after the provided number of days', () => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-15T12:00:00.000Z');
        expect(calculateTimestampAfterDays(30)).toBe(Date.UTC(2025, 1, 14));
    });

    test('floors fractional days before calculating the timestamp', () => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-15T12:00:00.000Z');
        expect(calculateTimestampAfterDays(1.9)).toBe(Date.UTC(2025, 0, 16));
    });
});

describe('getRelativeToDefault', () => {
    test('returns "Increased" when value is above default', () => {
        expect(getRelativeToDefault(200, 100)).toBe('Increased');
    });

    test('returns "Decreased" when value is below default', () => {
        expect(getRelativeToDefault(50, 100)).toBe('Decreased');
    });

    test('returns "Equal" when value equals default', () => {
        expect(getRelativeToDefault(100, 100)).toBe('Equal');
    });

    test('returns undefined when default value is undefined', () => {
        expect(getRelativeToDefault(100, undefined)).toBeUndefined();
    });
});

describe('getPercentageOfRange', () => {
    test('returns 0 when val equals min', () => {
        expect(getPercentageOfRange(0, 0, 1000)).toBe(0);
    });

    test('returns 100 when val equals max', () => {
        expect(getPercentageOfRange(1000, 0, 1000)).toBe(100);
    });

    test('returns 50 for the midpoint', () => {
        expect(getPercentageOfRange(500, 0, 1000)).toBe(50);
    });

    test('returns undefined when min is undefined', () => {
        expect(getPercentageOfRange(500, undefined, 1000)).toBeUndefined();
    });

    test('returns undefined when max is undefined', () => {
        expect(getPercentageOfRange(500, 0, undefined)).toBeUndefined();
    });

    test('returns undefined when both bounds are undefined', () => {
        expect(getPercentageOfRange(500, undefined, undefined)).toBeUndefined();
    });

    test('returns undefined when min equals max', () => {
        expect(getPercentageOfRange(500, 1000, 1000)).toBeUndefined();
    });
});
