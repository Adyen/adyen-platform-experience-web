import { describe, expect, test } from 'vitest';
import { getRelativeToDefault, getValuePercentage } from './utils';

describe('getRelativeToDefault', () => {
    test('returns "Increased" when val is above default', () => {
        expect(getRelativeToDefault(200, 100)).toBe('Increased');
    });

    test('returns "Decreased" when val is below default', () => {
        expect(getRelativeToDefault(50, 100)).toBe('Decreased');
    });

    test('returns "Equal" when val equals default', () => {
        expect(getRelativeToDefault(100, 100)).toBe('Equal');
    });

    test('returns undefined when defaultVal is undefined', () => {
        expect(getRelativeToDefault(100, undefined)).toBeUndefined();
    });
});

describe('getValuePercentage', () => {
    test('returns 0 when val equals min', () => {
        expect(getValuePercentage(0, 0, 1000)).toBe(0);
    });

    test('returns 100 when val equals max', () => {
        expect(getValuePercentage(1000, 0, 1000)).toBe(100);
    });

    test('returns 50 for the midpoint', () => {
        expect(getValuePercentage(500, 0, 1000)).toBe(50);
    });

    test('returns undefined when min is undefined', () => {
        expect(getValuePercentage(500, undefined, 1000)).toBeUndefined();
    });

    test('returns undefined when max is undefined', () => {
        expect(getValuePercentage(500, 0, undefined)).toBeUndefined();
    });

    test('returns undefined when both bounds are undefined', () => {
        expect(getValuePercentage(500, undefined, undefined)).toBeUndefined();
    });

    test('returns undefined when min equals max', () => {
        expect(getValuePercentage(500, 1000, 1000)).toBeUndefined();
    });
});
