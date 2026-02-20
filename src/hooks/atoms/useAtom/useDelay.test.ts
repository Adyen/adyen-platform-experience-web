/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useDelay } from './useDelay';

describe('useDelay', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should execute callback immediately when delay is 0 or undefined', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDelay(0));

        result.current.exec(callback);
        expect(callback).toHaveBeenCalledTimes(1);

        const { result: resultUndefined } = renderHook(() => useDelay(undefined));
        resultUndefined.current.exec(callback);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    test('should delay execution of callback', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDelay(1000));

        result.current.exec(callback);
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(500);
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(500);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should debounce multiple calls', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDelay(1000));

        result.current.exec(callback);
        vi.advanceTimersByTime(500);

        // Call again, should reset timer
        result.current.exec(callback);
        vi.advanceTimersByTime(500);
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(500);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should cancel pending execution', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDelay(1000));

        result.current.exec(callback);
        vi.advanceTimersByTime(500);

        result.current.cancel();
        vi.advanceTimersByTime(1000);

        expect(callback).not.toHaveBeenCalled();
    });

    test('should handle dynamic delay updates', () => {
        const callback = vi.fn();
        const { result, rerender } = renderHook(delay => useDelay(delay), { initialProps: 1000 });

        // Start with 1000ms delay
        result.current.exec(callback);
        vi.advanceTimersByTime(500);
        expect(callback).not.toHaveBeenCalled();

        // Change delay to 2000ms
        rerender(2000);

        vi.advanceTimersByTime(500); // Total 1000ms
        expect(callback).toHaveBeenCalledTimes(1);

        // New call should use 2000ms
        result.current.exec(callback);
        vi.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(1); // Still 1 from before

        vi.advanceTimersByTime(1000); // Total 2000ms
        expect(callback).toHaveBeenCalledTimes(2);
    });

    test('should cleanup on unmount', () => {
        const callback = vi.fn();
        const { result, unmount } = renderHook(() => useDelay(1000));

        result.current.exec(callback);
        unmount();

        vi.advanceTimersByTime(1000);
        expect(callback).not.toHaveBeenCalled();
    });

    test('should return stable function references', () => {
        const { result, rerender } = renderHook(() => useDelay(1000));
        const { exec, cancel } = result.current;

        rerender();

        expect(result.current.exec).toBe(exec);
        expect(result.current.cancel).toBe(cancel);
    });
});
