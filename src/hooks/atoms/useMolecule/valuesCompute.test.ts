import { describe, expect, test } from 'vitest';
import { createValuesComputeFn } from './valuesCompute';

describe('valuesCompute', () => {
    test('should compute initial values', () => {
        const compute = createValuesComputeFn<{ a: number; b: number }>();
        const keys: (keyof typeof members)[] = ['a', 'b'];

        const members = {
            a: { value: 1, $value: 1 },
            b: { value: 2, $value: 2 },
        };

        const result = compute(keys, members);

        expect(result.latestValue).toEqual({ a: 1, b: 2 });
        expect(result.usedValue).toEqual({ a: 1, b: 2 });
    });

    test('should return cached values if nothing changes', () => {
        const compute = createValuesComputeFn<{ a: number }>();
        const keys: (keyof typeof members)[] = ['a'];
        const members = { a: { value: 1, $value: 1 } };

        const result1 = compute(keys, members);
        const result2 = compute(keys, members); // Same inputs

        expect(result1.latestValue).toBe(result2.latestValue);
        expect(result1.usedValue).toBe(result2.usedValue);
    });

    test('should update latestValue independently of usedValue', () => {
        const compute = createValuesComputeFn<{ a: number }>();
        const keys: (keyof typeof members1)[] = ['a'];
        const members1 = { a: { value: 1, $value: 1 } };

        // Initial
        const result1 = compute(keys, members1);

        // Update $value only (e.g. delay pending)
        const members2 = { a: { value: 1, $value: 2 } };
        const result2 = compute(keys, members2);

        expect(result2.latestValue).toEqual({ a: 2 });
        expect(result2.usedValue).toEqual({ a: 1 });

        // Verify referential stability
        expect(result2.usedValue).toBe(result1.usedValue); // Should be same object
        expect(result2.latestValue).not.toBe(result1.latestValue);
    });

    test('should update usedValue independently of latestValue', () => {
        const compute = createValuesComputeFn<{ a: number }>();
        const keys: (keyof typeof members1)[] = ['a'];
        const members1 = { a: { value: 1, $value: 2 } };

        // Initial
        const result1 = compute(keys, members1);

        // Update value to match latest
        const members2 = { a: { value: 2, $value: 2 } };
        const result2 = compute(keys, members2);

        expect(result2.latestValue).toEqual({ a: 2 });
        expect(result2.usedValue).toEqual({ a: 2 });

        // Verify referential stability
        expect(result2.latestValue).toBe(result1.latestValue); // Should be same object
        expect(result2.usedValue).not.toBe(result1.usedValue);
    });

    test('should handle adding a key', () => {
        const compute = createValuesComputeFn<any>();

        // Initial: { a: 1 }
        const members1 = { a: { value: 1, $value: 1 } };
        const result1 = compute(['a'], members1);
        expect(result1.latestValue).toEqual({ a: 1 });

        // Add b: { a: 1, b: 2 }
        const members2 = { a: { value: 1, $value: 1 }, b: { value: 2, $value: 2 } };
        const result2 = compute(['a', 'b'], members2);

        expect(result2.latestValue).toEqual({ a: 1, b: 2 });
        expect(result2.usedValue).toEqual({ a: 1, b: 2 });
    });

    test('should handle removing a key', () => {
        const compute = createValuesComputeFn<any>();

        // Initial: { a: 1, b: 2 }
        const members1 = { a: { value: 1, $value: 1 }, b: { value: 2, $value: 2 } };
        const result1 = compute(['a', 'b'], members1);
        expect(result1.latestValue).toEqual({ a: 1, b: 2 });

        // Remove b: { a: 1 }
        const members2 = { a: { value: 1, $value: 1 } };
        const result2 = compute(['a'], members2);

        expect(result2.latestValue).toEqual({ a: 1 });
        expect(result2.usedValue).toEqual({ a: 1 });
        expect(result2.latestValue).not.toHaveProperty('b');
    });

    test('should handle swapping a key (same length)', () => {
        const compute = createValuesComputeFn<any>();

        // Initial: { a: 1 }
        const members1 = { a: { value: 1, $value: 1 } };
        const result1 = compute(['a'], members1);
        expect(result1.latestValue).toEqual({ a: 1 });

        // Swap a -> b: { b: 2 }
        const members2 = { b: { value: 2, $value: 2 } };
        const result2 = compute(['b'], members2);

        expect(result2.latestValue).toEqual({ b: 2 });
        expect(result2.latestValue).not.toHaveProperty('a');
    });

    test('should handle value change to undefined', () => {
        const compute = createValuesComputeFn<{ a: number | undefined }>();
        const keys: (keyof typeof members1)[] = ['a'];

        // Initial: { a: 1 }
        const members1 = { a: { value: 1, $value: 1 } };
        const result1 = compute(keys, members1);

        // Change to undefined
        const members2 = { a: { value: undefined, $value: undefined } };
        const result2 = compute(keys, members2);

        expect(result2.latestValue).toEqual({ a: undefined });
        expect(result2.usedValue).toEqual({ a: undefined });
        expect(result2.latestValue).not.toBe(result1.latestValue);
    });
});
