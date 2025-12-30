/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import useComponentTiming from './useComponentTiming';

describe('useComponentTiming', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should have an undefined duration on initial render', () => {
        const { result } = renderHook(() => useComponentTiming());
        expect(result.current.duration.current).toBeUndefined();
    });

    test('should calculate duration on unmount', () => {
        const { result, unmount } = renderHook(() => useComponentTiming());

        // Simulate time passing
        vi.advanceTimersByTime(500);

        unmount();

        // The duration should be the time passed between mount and unmount
        expect(result.current.duration.current).toBe(500);
    });

    test('should not change duration on re-renders', () => {
        const { result, rerender, unmount } = renderHook(() => useComponentTiming());

        vi.advanceTimersByTime(200);
        rerender();
        vi.advanceTimersByTime(300);

        unmount();

        expect(result.current.duration.current).toBe(500);
    });
});
