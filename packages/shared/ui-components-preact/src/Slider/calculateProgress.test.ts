import { calculateProgress } from './calculateProgress';
import { describe, test, expect } from 'vitest';

describe('calculateProgress', () => {
    test('should return 0% for an invalid range where min > max', () => {
        expect(calculateProgress(50, 100, 0, 10)).toBe(0);
        expect(calculateProgress(50, 50, 50, 10)).toBe(0);
    });

    test('should return 0% when currentValue is below min', () => {
        expect(calculateProgress(-10, 0, 100, 10)).toBe(0);
    });

    test('should return 100% when currentValue is above max', () => {
        expect(calculateProgress(110, 0, 100, 10)).toBe(100);
    });

    test('should return 0% when currentValue is equal to min', () => {
        expect(calculateProgress(0, 0, 100, 10)).toBe(0);
        expect(calculateProgress(10, 10, 100, 10)).toBe(0);
    });

    test('should return 0% when step is higher than max', () => {
        expect(calculateProgress(-10, -20, 100, 101)).toBe(0);
        expect(calculateProgress(0, 0, 1, 2)).toBe(0);
        expect(calculateProgress(2000, 0, 1000, 1001)).toBe(0);
    });

    test('should snap and calculate the correct progress percentage for a valid range', () => {
        expect(calculateProgress(50, 0, 100, 10)).toBe(50);
        expect(calculateProgress(550, 0, 1000, 100)).toBe(60);
        expect(calculateProgress(130, 0, 200, 20)).toBe(70);
        expect(calculateProgress(67, 0, 100, 10)).toBe(70);
        expect(calculateProgress(67, 0, 100, 2)).toBe(68);
        expect(calculateProgress(-50, -100, 0, 10)).toBe(50);
        expect(calculateProgress(-75, -100, 0, 5)).toBe(25);
        expect(calculateProgress(-25, -100, 0, 5)).toBe(75);
        expect(calculateProgress(-50, -100, 100, 50)).toBe(25);
        expect(calculateProgress(0, -50, 50, 10)).toBe(50);
        expect(calculateProgress(-40, -100, -20, 10)).toBe(75);
        expect(calculateProgress(8300, 500, 25000, 100)).toBe(31.84);
    });

    test('should snap correctly for floating-point currentValue', () => {
        expect(calculateProgress(5.5, 0, 10, 1)).toBe(60);
        expect(calculateProgress(4.2, 0, 10, 0.5)).toBe(40);
        expect(calculateProgress(4.75, 0, 10, 0.5)).toBe(50);
    });

    test('should clamp the percentage between 0% and 100%', () => {
        expect(calculateProgress(-50, 0, 100, 10)).toBe(0);
        expect(calculateProgress(150, 0, 100, 10)).toBe(100);
    });

    test('should return 0% for min = max', () => {
        expect(calculateProgress(50, 50, 50, 10)).toBe(0);
    });

    test('should handle invalid step sizes and default to 1', () => {
        expect(calculateProgress(50, 0, 100, 0)).toBe(50);
        expect(calculateProgress(50, 0, 100, -10)).toBe(50);
    });
});
