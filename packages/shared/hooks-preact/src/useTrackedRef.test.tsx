/**
 * @vitest-environment jsdom
 */
import { createRef } from 'preact';
import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useTrackedRef, TrackedRef } from './useTrackedRef';

describe('useTrackedRef', () => {
    test('should return trackedRef even if ref is not provided', () => {
        const trackedRef = renderHook(() => useTrackedRef()).result.current;

        // calling trackedRef with instance
        for (let i = 0; i < 3; i++) {
            trackedRef(i);
            expect(trackedRef.current).toBe(i);
        }

        // assigning instance to trackedRef.current
        for (let i = 0; i < 3; i++) {
            trackedRef.current = i;
            expect(trackedRef.current).toBe(i);
        }
    });

    test('should track ref callback', () => {
        const refCallback = vi.fn();
        const trackedRef = renderHook(() => useTrackedRef(refCallback)).result.current;

        // calling trackedRef with instance
        for (let i = 0; i < 3; i++) {
            trackedRef(i);
            expect(trackedRef.current).toBe(i);
            expect(refCallback).toHaveBeenCalledTimes(i + 1);
            expect(refCallback).toHaveBeenLastCalledWith(i);
        }

        refCallback.mockRestore();

        // assigning instance to trackedRef.current
        for (let i = 0; i < 3; i++) {
            trackedRef.current = i;
            expect(trackedRef.current).toBe(i);
            expect(refCallback).toHaveBeenCalledTimes(i + 1);
            expect(refCallback).toHaveBeenLastCalledWith(i);
        }
    });

    test('should track ref object', () => {
        const refObject = createRef();
        const trackedRef = renderHook(() => useTrackedRef(refObject)).result.current;

        expect(trackedRef.current).toBe(refObject.current);

        // calling trackedRef with instance
        for (let i = 0; i < 3; i++) {
            trackedRef(i);
            expect(trackedRef.current).toBe(i);
            expect(refObject.current).toBe(i);
        }

        // assigning instance to trackedRef.current
        for (let i = 0; i < 3; i++) {
            trackedRef.current = i;
            expect(trackedRef.current).toBe(i);
            expect(refObject.current).toBe(i);
        }
    });

    test('should return new trackedRef if provided ref changes', () => {
        const { rerender, result } = renderHook<TrackedRef<any>, any>((ref = createRef()) => useTrackedRef(ref));
        const trackedRef_1 = result.current;

        rerender(createRef());

        const trackedRef_2 = result.current;

        expect(trackedRef_2).not.toBe(trackedRef_1);
    });

    test('should be initialized with ref object current instance', () => {
        const ref_1 = createRef();
        const { rerender, result } = renderHook<TrackedRef<any>, any>((ref = ref_1) => useTrackedRef(ref));
        const trackedRef_1 = result.current;

        expect(trackedRef_1.current).toBe(ref_1.current);

        const ref_2 = createRef();
        ref_2.current = 100;

        rerender(ref_2);

        const trackedRef_2 = result.current;

        expect(trackedRef_2.current).toBe(ref_2.current);
    });
});
