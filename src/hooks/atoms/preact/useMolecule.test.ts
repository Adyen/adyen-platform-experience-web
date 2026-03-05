/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { AtomicValue } from '../core/types';
import { useAtom } from './useAtom';
import { useMolecule } from './useMolecule';

describe('useMolecule', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should initialize with member values', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom({ initialValue: 2 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        expect(result.current.value).toEqual({ a: 1, b: 2 });
        expect(result.current.$value).toEqual({ a: 1, b: 2 });
        expect(result.current.$$value).toEqual({ a: 1, b: 2 });
        expect(result.current.initialized).toBe(true);
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(true);
    });

    test('should update member values via set', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom({ initialValue: 2 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        act(() => {
            result.current.set({ a: 10 });
        });

        expect(result.current.value).toEqual({ a: 10, b: 2 });
        expect(result.current.$value).toEqual({ a: 10, b: 2 });
        expect(result.current.$$value).toEqual({ a: 10, b: 2 });
        expect(result.current.pristine).toBe(false);
    });

    test('should handle delayed updates independently', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1, delay: 0 });
            const atom2 = useAtom({ initialValue: 2, delay: 1000 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        // Update both
        act(() => {
            result.current.set({ a: 10, b: 20 });
        });

        expect(result.current.$value).toEqual({ a: 10, b: 20 });
        expect(result.current.$$value).toEqual({ a: 10, b: 2 }); // B is still 2
        expect(result.current.value).toEqual({ a: 1, b: 2 }); // all values not updated yet (all or nothing)
        expect(result.current.stale).toBe(true);
        expect(result.current.pristine).toBe(false); // A is dirty immediately

        // Advance time partially
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.$$value).toEqual({ a: 10, b: 2 });
        expect(result.current.value).toEqual({ a: 1, b: 2 });

        // Advance time fully
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.$$value).toEqual({ a: 10, b: 20 });
        expect(result.current.value).toEqual({ a: 10, b: 20 });
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);
    });

    test('should handle deferred members correctly', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom<number>({ deferredInitialValue: true });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        expect(result.current.value).toEqual({ a: 1, b: undefined });
        expect(result.current.initialized).toBe(false);
        expect(result.current.pristine).toBe(true);

        act(() => {
            result.current.set({ b: 2 });
        });

        expect(result.current.value).toEqual({ a: 1, b: 2 });
        expect(result.current.initialized).toBe(true);
        expect(result.current.pristine).toBe(true);
    });

    test('should handle multiple deferred members correctly', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom<number>({ deferredInitialValue: true });
            const atom2 = useAtom<string>({ deferredInitialValue: true });
            return {
                molecule: useMolecule({ members: { a: atom1, b: atom2 } }),
                setA: atom1.set,
            };
        });

        expect(result.current.molecule.value).toEqual({ a: undefined, b: undefined });
        expect(result.current.molecule.initialized).toBe(false);
        expect(result.current.molecule.pristine).toBe(true);

        // Initialize "a" directly (atom setter)
        act(() => {
            result.current.setA(1);
        });

        expect(result.current.molecule.value).toEqual({ a: 1, b: undefined });
        expect(result.current.molecule.initialized).toBe(false);
        expect(result.current.molecule.pristine).toBe(true);

        // Initialize "b" indirectly (molecule setter)
        act(() => {
            result.current.molecule.set({ b: 'hello' });
        });

        expect(result.current.molecule.value).toEqual({ a: 1, b: 'hello' });
        expect(result.current.molecule.initialized).toBe(true);
        expect(result.current.molecule.pristine).toBe(true);
    });

    test('should reset all members to initial value', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom({ initialValue: 2 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        act(() => {
            result.current.set({ a: 10, b: 20 });
        });

        expect(result.current.value).toEqual({ a: 10, b: 20 });
        expect(result.current.pristine).toBe(false);

        act(() => {
            result.current.reset();
        });

        expect(result.current.value).toEqual({ a: 1, b: 2 });
        expect(result.current.pristine).toBe(true);
    });

    test('should reset all members to last committed value when requested', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1, delay: 1000 });
            const atom2 = useAtom({ initialValue: 2 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        act(() => {
            result.current.set({ a: 10, b: 20 });
        });

        // Advance time to commit updated value
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.value).toEqual({ a: 10, b: 20 });
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);

        act(() => {
            result.current.set({ a: 100, b: 200 });
        });

        // Partially advance time before reset
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.value).toEqual({ a: 10, b: 20 });
        expect(result.current.stale).toBe(true);
        expect(result.current.pristine).toBe(false);

        act(() => {
            result.current.reset(AtomicValue.LAST);
        });

        expect(result.current.value).toEqual({ a: 10, b: 20 });
        expect(result.current.stale).toBe(false);
        expect(result.current.pristine).toBe(false);
    });

    test('should reset all members to match specific value when requested', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom({ initialValue: 2 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        act(() => {
            result.current.set({ a: 10, b: 20 });
        });

        expect(result.current.value).toEqual({ a: 10, b: 20 });
        expect(result.current.pristine).toBe(false);

        act(() => {
            // Extra keys in the specified reset value are ignored
            result.current.reset({ a: 100, c: 200 } as any);
        });

        // Missing keys (e.g. member B) in the specified reset value retain their current value
        expect(result.current.value).toEqual({ a: 100, b: 20 });
        expect(result.current.pristine).toBe(false);
    });

    test('should handle partial equality check', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom({ initialValue: 2 });
            return useMolecule({ members: { a: atom1, b: atom2 } });
        });

        // Subset match
        expect(result.current.equals({ a: 1 })).toBe(true);

        // Subset mismatch
        expect(result.current.equals({ a: 2 })).toBe(false);

        // Full match
        expect(result.current.equals({ a: 1, b: 2 })).toBe(true);

        // Full mismatch
        expect(result.current.equals({ a: 1, b: 3 })).toBe(false);

        // Extra keys (ignored) — effectively true if subset matches
        expect(result.current.equals({ a: 1, c: 3 } as any)).toBe(true);
    });

    test('should handle dynamic members (adding/removing)', () => {
        const { result, rerender } = renderHook(
            ({ showB }) => {
                const atom1 = useAtom({ initialValue: 1 });
                const atom2 = useAtom({ initialValue: 2 });
                const members: any = showB ? { a: atom1, b: atom2 } : { a: atom1 };
                return useMolecule({ members });
            },
            { initialProps: { showB: true } }
        );

        expect(result.current.value).toEqual({ a: 1, b: 2 });

        // Remove member B
        rerender({ showB: false });
        expect(result.current.value).toEqual({ a: 1 });

        // Add member B back
        rerender({ showB: true });
        expect(result.current.value).toEqual({ a: 1, b: 2 });
    });

    test('should handle nested molecules', () => {
        const { result } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            const atom2 = useAtom({ initialValue: 2 });
            const innerMolecule = useMolecule({ members: { b: atom2 } });
            return useMolecule({ members: { a: atom1, b: atom2, nested: innerMolecule } });
        });

        expect(result.current.value).toEqual({ a: 1, b: 2, nested: { b: 2 } });
        expect(result.current.pristine).toBe(true);

        act(() => {
            result.current.set({ nested: { b: 20 } });
        });

        expect(result.current.value).toEqual({ a: 1, b: 20, nested: { b: 20 } });
        expect(result.current.pristine).toBe(false);
    });

    test('should maintain referential stability of value object if content is same', () => {
        const { result, rerender } = renderHook(() => {
            const atom1 = useAtom({ initialValue: 1 });
            return useMolecule({ members: { a: atom1 } });
        });

        const initialValueObj = result.current.value;

        rerender();
        expect(result.current.value).toBe(initialValueObj);
    });
});
