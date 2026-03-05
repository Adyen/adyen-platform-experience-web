/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { AtomicValue } from '../core/types';
import { useAtom } from './useAtom';

describe('useAtom', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should initialize with default value', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial' }));

        expect(result.current.value).toBe('initial');
        expect(result.current.$value).toBe('initial');
        expect(result.current.initialized).toBe(true);
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(true);
    });

    test('should not drift pristine when initialValue prop changes', () => {
        const { result, rerender } = renderHook(({ initialValue }) => useAtom({ initialValue }), { initialProps: { initialValue: 'a' } });

        expect(result.current.value).toBe('a');
        expect(result.current.pristine).toBe(true);

        // Change initialValue prop
        rerender({ initialValue: 'b' });

        // atom value should remain 'a'
        expect(result.current.value).toBe('a');
        expect(result.current.pristine).toBe(true);
    });

    test('should update value immediately when delay is 0', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 0 }));

        act(() => {
            result.current.set('updated');
        });

        expect(result.current.value).toBe('updated');
        expect(result.current.$value).toBe('updated');
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);
    });

    test('should delay value update when delay is set', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 1000 }));

        act(() => {
            result.current.set('updated');
        });

        expect(result.current.$value).toBe('updated');
        expect(result.current.value).toBe('initial');
        expect(result.current.stale).toBe(true);
        expect(result.current.pristine).toBe(true);

        act(() => {
            // Advance time partially
            vi.advanceTimersByTime(500);
        });

        expect(result.current.value).toBe('initial');
        expect(result.current.stale).toBe(true);

        act(() => {
            // Advance time fully
            vi.advanceTimersByTime(500);
        });

        expect(result.current.value).toBe('updated');
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);
    });

    test('should debounce multiple updates', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 1000 }));

        act(() => {
            result.current.set('update1');
        });

        expect(result.current.$value).toBe('update1');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Update again before delay finishes
        act(() => {
            result.current.set('update2');
        });

        expect(result.current.$value).toBe('update2');
        expect(result.current.value).toBe('initial'); // Still initial

        // Advance time past the first delay (total 1000ms from start)
        // But since we updated at 500ms, the timer reset.
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.value).toBe('initial');

        // Advance time to complete the second delay (total 1500ms from start)
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.value).toBe('update2');
        expect(result.current.stale).toBe(false);
    });

    test('should cancel pending updates when set reverts to value', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'a', delay: 1000 }));

        act(() => {
            result.current.set('b');
        });

        expect(result.current.$value).toBe('b');
        expect(result.current.value).toBe('a');
        expect(result.current.stale).toBe(true);

        // Revert to current used value
        act(() => {
            result.current.set('a');
        });

        expect(result.current.$value).toBe('a');
        expect(result.current.value).toBe('a');
        expect(result.current.stale).toBe(false);

        // Advance time — the pending timeout from set('b') should have been canceled
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.value).toBe('a');
        expect(result.current.$value).toBe('a');
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(true);
    });

    test('should handle deferred initialization', () => {
        const { result } = renderHook(() => useAtom({ deferredInitialValue: true }));

        // Initially undefined (awaiting value)
        expect(result.current.value).toBeUndefined();
        expect(result.current.$value).toBeUndefined();
        expect(result.current.initialized).toBe(false);
        expect(result.current.pristine).toBe(true);

        // First update should be immediate regardless of delay
        // Default delay is 0 anyway, but let's test logic
        act(() => {
            result.current.set('first');
        });

        expect(result.current.value).toBe('first');
        expect(result.current.$value).toBe('first');
        expect(result.current.initialized).toBe(true);
        expect(result.current.pristine).toBe(true);
    });

    test('should handle deferred initialization with delay', () => {
        const { result } = renderHook(() => useAtom({ deferredInitialValue: true, delay: 1000 }));

        // First update should be immediate even with delay
        act(() => {
            result.current.set('first');
        });

        expect(result.current.value).toBe('first');
        expect(result.current.$value).toBe('first');
        expect(result.current.initialized).toBe(true);
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(true);

        // Subsequent updates should be delayed
        act(() => {
            result.current.set('second');
        });

        expect(result.current.$value).toBe('second');
        expect(result.current.value).toBe('first');
        expect(result.current.initialized).toBe(true);
        expect(result.current.stale).toBe(true);
        expect(result.current.pristine).toBe(true);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.value).toBe('second');
        expect(result.current.initialized).toBe(true);
        expect(result.current.pristine).toBe(false); // Now dirty
    });

    test('should distinguish undefined from uninitialized state', () => {
        const { result } = renderHook(() => useAtom<string | undefined>({ deferredInitialValue: true }));

        // Before initialization
        expect(result.current.initialized).toBe(false);
        expect(result.current.value).toBeUndefined();

        // Initialize the atom (string)
        act(() => {
            result.current.set('hello');
        });

        expect(result.current.initialized).toBe(true);
        expect(result.current.value).toBe('hello');

        // Set to undefined (valid value)
        act(() => {
            result.current.set(undefined);
        });

        // Key distinction: value is undefined, but initialized is true
        expect(result.current.initialized).toBe(true);
        expect(result.current.value).toBeUndefined();
    });

    test('should use custom equality function', () => {
        const equals = (a: { id: number }, b: { id: number }) => a.id === b.id;

        const initial = { id: 1, data: 'a' };
        const updateSameId = { id: 1, data: 'b' }; // Semantically equal
        const updateDiffId = { id: 2, data: 'a' }; // Different

        const { result } = renderHook(() => useAtom({ initialValue: initial, equals, delay: 0 }));

        // Update with semantically equal value
        act(() => {
            result.current.set(updateSameId);
        });

        // Should not update value (reference might be canonicalized to initial or kept as is depending on implementation details,
        // but value should be semantically equal and stale should be false)
        expect(result.current.value).toBe(initial);
        expect(result.current.$value).toBe(initial);
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(true); // Semantically equal to initial

        // Update with different value
        act(() => {
            result.current.set(updateDiffId);
        });

        expect(result.current.value).toBe(updateDiffId);
        expect(result.current.$value).toBe(updateDiffId);
        expect(result.current.pristine).toBe(false);
    });

    test('should use updated equality function immediately', () => {
        const sameId = (a: { id: number }, b: { id: number }) => a.id === b.id;
        const sameObj = Object.is;

        const obj = { id: 1 };
        const objCopy = { id: 1 };

        const { result, rerender } = renderHook(({ equals }) => useAtom({ initialValue: obj, equals: equals as any }), {
            initialProps: { equals: sameId },
        });

        act(() => {
            result.current.set(objCopy);
        });

        // Not updated — sameId says objCopy is equal to obj
        expect(result.current.value).toBe(obj);

        // Switch to sameObj
        rerender({ equals: sameObj });

        act(() => {
            result.current.set(objCopy);
        });

        // Updated — sameObj says different
        expect(result.current.value).toBe(objCopy);
    });

    test('should reset to initial value', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 1000 }));

        act(() => {
            result.current.set('updated');
        });

        // Pending update
        expect(result.current.stale).toBe(true);

        act(() => {
            result.current.reset();
        });

        // Should be immediate and cancel pending
        expect(result.current.value).toBe('initial');
        expect(result.current.$value).toBe('initial');
        expect(result.current.initialized).toBe(true);
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(true);

        // Advance time to ensure no delayed update overwrites it
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.value).toBe('initial');
    });

    test('should reset to first set value for deferred initialization', () => {
        const { result } = renderHook(() => useAtom({ deferredInitialValue: true }));

        // First set (becomes initial)
        act(() => {
            result.current.set('first');
        });

        expect(result.current.value).toBe('first');
        expect(result.current.initialized).toBe(true);
        expect(result.current.pristine).toBe(true);

        // Second set (dirty)
        act(() => {
            result.current.set('second');
        });

        expect(result.current.value).toBe('second');
        expect(result.current.initialized).toBe(true);
        expect(result.current.pristine).toBe(false);

        // Reset
        act(() => {
            result.current.reset();
        });

        // Should go back to 'first'
        expect(result.current.value).toBe('first');
        expect(result.current.initialized).toBe(true);
        expect(result.current.pristine).toBe(true);
    });

    test('should reset to last committed value when requested', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 1000 }));

        act(() => {
            result.current.set('update1');
        });

        // Pending update
        expect(result.current.stale).toBe(true);

        // Advance time to commit updated value
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);

        act(() => {
            result.current.set('update2');
        });

        // Pending update
        expect(result.current.value).toBe('update1');
        expect(result.current.$value).toBe('update2');
        expect(result.current.stale).toBe(true);

        act(() => {
            result.current.reset(AtomicValue.LAST);
        });

        // Should be immediate and cancel pending
        expect(result.current.value).toBe('update1');
        expect(result.current.$value).toBe('update1');
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);

        // Advance time to ensure no delayed update overwrites it
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.value).toBe('update1');
        expect(result.current.$value).toBe('update1');
    });

    test('should reset to specific value when requested', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 1000 }));

        act(() => {
            result.current.set('updated');
        });

        // Pending update
        expect(result.current.stale).toBe(true);

        act(() => {
            result.current.reset('reset');
        });

        // Should be immediate and cancel pending
        expect(result.current.value).toBe('reset');
        expect(result.current.$value).toBe('reset');
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);

        // Advance time to ensure no delayed update overwrites it
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.value).toBe('reset');
    });

    test('should handle race condition between set and reset', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial', delay: 1000 }));

        act(() => {
            result.current.set('update1');
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Reset should cancel the pending 'update1'
        act(() => {
            result.current.reset();
        });

        expect(result.current.value).toBe('initial');

        // Advance time past when 'update1' would have fired
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.value).toBe('initial');
    });

    test('should not update if value is referentially equal', () => {
        const initial = { id: 1 };
        const { result } = renderHook(() => useAtom({ initialValue: initial }));

        act(() => {
            result.current.set(initial);
        });

        expect(result.current.value).toBe(initial);
    });

    test('should maintain stable set and reset references across value changes', () => {
        const { result } = renderHook(() => useAtom({ initialValue: 'initial' }));

        const initialSet = result.current.set;
        const initialReset = result.current.reset;

        act(() => {
            result.current.set('update1');
        });

        expect(result.current.set).toBe(initialSet);
        expect(result.current.reset).toBe(initialReset);

        act(() => {
            result.current.set('update2');
        });

        expect(result.current.set).toBe(initialSet);
        expect(result.current.reset).toBe(initialReset);
    });
});
