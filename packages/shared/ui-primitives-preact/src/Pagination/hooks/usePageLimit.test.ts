/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../constants';
import usePageLimit, { getNearestFromSortedUniqueNums } from './usePageLimit';

describe('usePageLimit', () => {
    test('should handle default and undefined scenarios', () => {
        const testCases = [
            {
                props: {},
                expectedLimit: DEFAULT_PAGE_LIMIT,
                expectedOptions: undefined,
            },
            {
                props: { preferredLimit: 10 },
                expectedLimit: 10,
                expectedOptions: undefined,
            },
            {
                props: { preferredLimit: 10, preferredLimitOptions: null as any },
                expectedLimit: 10,
                expectedOptions: undefined,
            },
            {
                props: { preferredLimit: 15, preferredLimitOptions: undefined },
                expectedLimit: 15,
                expectedOptions: undefined,
            },
        ];

        testCases.forEach(({ props, expectedLimit, expectedOptions }) => {
            const { result } = renderHook(() => usePageLimit(props));
            expect(Object.isFrozen(result.current.limitOptions)).toBe(true);
            expect(result.current.limitOptions).toBe(expectedOptions);
            expect(result.current.limit).toBe(expectedLimit);
        });
    });

    test('should handle basic limit and options scenarios', () => {
        const testCases = [
            {
                props: { preferredLimit: 25 },
                expectedLimit: 25,
                expectedOptions: undefined,
            },
            {
                props: { preferredLimitOptions: [10, 20, 50], preferredLimit: 20 },
                expectedLimit: 20,
                expectedOptions: [10, 20, 50],
            },
            {
                props: { preferredLimit: 10, preferredLimitOptions: [10, 20, 10, 50] },
                expectedLimit: 10,
                expectedOptions: [10, 20, 50],
            },
            {
                props: { preferredLimit: 10, preferredLimitOptions: [-5, 20, 0] },
                expectedLimit: 20,
                expectedOptions: [20],
            },
        ];

        testCases.forEach(({ props, expectedLimit, expectedOptions }) => {
            const { result } = renderHook(() => usePageLimit(props));
            expect(result.current.limitOptions).toEqual(expectedOptions);
            expect(result.current.limit).toBe(expectedLimit);
        });
    });

    test('should handle complex limit selection logic', () => {
        const testCases = [
            { preferredLimit: 15, preferredLimitOptions: [10, 20, 50], expectedLimit: 10 },
            { preferredLimit: 15, preferredLimitOptions: [5, 10, 20, 30], expectedLimit: 10 },
            { preferredLimit: 25, preferredLimitOptions: [10, 20, 30, 40], expectedLimit: 20 },
        ];

        testCases.forEach(({ preferredLimit, preferredLimitOptions, expectedLimit }) => {
            const { result } = renderHook(() => usePageLimit({ preferredLimit, preferredLimitOptions }));
            expect(result.current.limitOptions).toEqual(preferredLimitOptions);
            expect(result.current.limit).toBe(expectedLimit);
        });
    });

    test('should handle invalid preferred limits', () => {
        const testCases = [
            { preferredLimit: 150, expectedLimit: MAX_PAGE_LIMIT },
            { preferredLimit: 0, expectedLimit: DEFAULT_PAGE_LIMIT },
            { preferredLimit: -5, expectedLimit: DEFAULT_PAGE_LIMIT },
            { preferredLimit: 15.7, expectedLimit: 15 },
        ];

        testCases.forEach(({ preferredLimit, expectedLimit }) => {
            const { result } = renderHook(() => usePageLimit({ preferredLimit }));
            expect(result.current.limit).toBe(expectedLimit);
        });
    });

    test('should maintain cached limit when options remain the same', () => {
        const options = { preferredLimit: 20, preferredLimitOptions: [10, 20] } as const;
        const { result, rerender } = renderHook(usePageLimit, { initialProps: options });

        expect(result.current.limit).toBe(options.preferredLimit);
        rerender(options);
        expect(result.current.limit).toBe(options.preferredLimit);
    });

    test('should recalculate limit correctly when preferred limit changes', () => {
        const options = { preferredLimit: 15, preferredLimitOptions: [10, 20, 30] };
        const { result, rerender } = renderHook(usePageLimit, { initialProps: options });
        expect(result.current.limit).toBe(10); // Finds nearest for 15

        rerender({ ...options, preferredLimit: 25 });
        expect(result.current.limit).toBe(10); // Limit unchanged (25 not in limit options)

        rerender({ ...options, preferredLimit: 20 });
        expect(result.current.limit).toBe(20);
    });

    test('should update limit when cached limit becomes invalid', () => {
        const { result, rerender } = renderHook(usePageLimit, { initialProps: { preferredLimit: 15, preferredLimitOptions: [10, 20] } });
        expect(result.current.limit).toBe(10);
        rerender({ preferredLimit: 25, preferredLimitOptions: [30, 40] });
        expect(result.current.limit).toBe(30);
    });
});

describe('getNearestFromSortedUniqueNums', () => {
    test('should handle boundary conditions', () => {
        const testCases = [
            { nums: [], target: 15, expected: 15 },
            { nums: [10, 20, 30], target: 5, expected: 10 },
            { nums: [10, 20, 30], target: 10, expected: 10 },
            { nums: [10, 20, 30], target: 35, expected: 30 },
            { nums: [10, 20, 30], target: 30, expected: 30 },
        ];

        testCases.forEach(({ nums, target, expected }) => {
            expect(getNearestFromSortedUniqueNums(nums, target)).toBe(expected);
        });
    });

    test('should find exact matches and nearest values', () => {
        const testCases = [
            { nums: [10, 20, 30, 40], target: 20, expected: 20 },
            { nums: [5, 15, 25], target: 15, expected: 15 },
            { nums: [10, 20, 30, 40], target: 25, expected: 20 },
            { nums: [10, 20, 30, 40], target: 15, expected: 10 },
            { nums: [5, 10, 20, 50], target: 12, expected: 10 },
        ];

        testCases.forEach(({ nums, target, expected }) => {
            expect(getNearestFromSortedUniqueNums(nums, target)).toBe(expected);
        });
    });

    test('should handle edge cases', () => {
        const largeNumsArray = Array.from({ length: 100 }, (_, i) => (i + 1) * 10);
        const singleNumArray = [15];

        const singleElementCases = [
            { nums: singleNumArray, target: 10, expected: 15 },
            { nums: singleNumArray, target: 20, expected: 15 },
            { nums: singleNumArray, target: 15, expected: 15 },
        ];

        singleElementCases.forEach(({ nums, target, expected }) => {
            expect(getNearestFromSortedUniqueNums(nums, target)).toBe(expected);
        });

        // Large array for efficiency test
        expect(getNearestFromSortedUniqueNums(largeNumsArray, 555)).toBe(550);
        expect(getNearestFromSortedUniqueNums(largeNumsArray, 234)).toBe(230);
    });
});
