/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useUniqueId } from './useUniqueId';

describe('useUniqueId', () => {
    test('should return a unique id for every initial render', () => {
        const uniqueIds: string[] = [];

        for (let i = 0; i < 3; i++) {
            const { result } = renderHook(() => useUniqueId());
            const uniqueId = result.current;

            expect(uniqueId).not.toBe('');
            expect(uniqueIds).not.toContain(uniqueId);

            uniqueIds.push(uniqueId);
        }
    });

    test('should return the same id for every re-render', () => {
        const { result, rerender } = renderHook(() => useUniqueId());
        const uniqueId = result.current;

        rerender();
        expect(result.current).toBe(uniqueId);
    });
});
