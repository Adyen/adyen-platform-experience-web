import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createAtom } from './atom';
import { AtomicValue } from './types';

describe('createAtom', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should initialize with value', () => {
        const atom = createAtom({ initialValue: 42 });

        expect(atom.value).toBe(42);
        expect(atom.$value).toBe(42);
        expect(atom.$$value).toBe(42);
        expect(atom.stale).toBe(false);
        expect(atom.pristine).toBe(true);
        expect(atom.initialized).toBe(true);
    });

    test('should initialize without value as undefined', () => {
        const atom = createAtom();

        expect(atom.value).toBeUndefined();
        expect(atom.$value).toBeUndefined();
        expect(atom.stale).toBe(false);
        expect(atom.pristine).toBe(true);
        expect(atom.initialized).toBe(true);
    });

    test('should set value immediately when delay is 0', () => {
        const atom = createAtom({ initialValue: 1 });

        atom.set(2);

        expect(atom.value).toBe(2);
        expect(atom.$value).toBe(2);
        expect(atom.stale).toBe(false);
        expect(atom.pristine).toBe(false);
    });

    test('should delay value commit when delay is set', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        atom.set(2);

        expect(atom.$value).toBe(2);
        expect(atom.value).toBe(1);
        expect(atom.stale).toBe(true);

        vi.advanceTimersByTime(500);

        expect(atom.value).toBe(2);
        expect(atom.stale).toBe(false);
        expect(atom.pristine).toBe(false);
    });

    test('should debounce multiple set calls', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        atom.set(2);
        vi.advanceTimersByTime(200);
        atom.set(3);
        vi.advanceTimersByTime(200);
        atom.set(4);

        expect(atom.$value).toBe(4);
        expect(atom.value).toBe(1);

        vi.advanceTimersByTime(500);

        expect(atom.value).toBe(4);
        expect(atom.stale).toBe(false);
    });

    test('should deduplicate set with same value', () => {
        const listener = vi.fn();
        const atom = createAtom({ initialValue: 1 });
        atom.subscribe(listener);

        atom.set(2);
        expect(listener).toHaveBeenCalledTimes(1);

        atom.set(2);
        expect(listener).toHaveBeenCalledTimes(1); // no change
    });

    test('should cancel pending delay when set reverts to committed value', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        atom.set(2);
        expect(atom.stale).toBe(true);

        atom.set(1); // revert to committed
        expect(atom.stale).toBe(false);
        expect(atom.$value).toBe(1);

        vi.advanceTimersByTime(500);
        expect(atom.value).toBe(1); // no commit happened
    });

    test('should handle deferred initialization', () => {
        const atom = createAtom<number>({ deferredInitialValue: true });

        expect(atom.initialized).toBe(false);
        expect(atom.value).toBeUndefined();
        expect(atom.$value).toBeUndefined();
        expect(atom.pristine).toBe(true);

        atom.set(42);

        expect(atom.initialized).toBe(true);
        expect(atom.value).toBe(42);
        expect(atom.$value).toBe(42);
        expect(atom.pristine).toBe(true); // first value becomes initial
    });

    test('should handle deferred initialization with delay', () => {
        const atom = createAtom<number>({ deferredInitialValue: true, delay: 500 });

        atom.set(42);

        // Deferred first set commits immediately regardless of delay
        expect(atom.initialized).toBe(true);
        expect(atom.value).toBe(42);
        expect(atom.pristine).toBe(true);
    });

    test('should distinguish undefined from uninitialized state', () => {
        const atom = createAtom<number | undefined>({ deferredInitialValue: true });

        expect(atom.initialized).toBe(false);

        atom.set(undefined);

        // undefined is a valid domain value — should initialize
        expect(atom.initialized).toBe(true);
        expect(atom.value).toBeUndefined();
        expect(atom.pristine).toBe(true);
    });

    test('should use custom equality function', () => {
        const atom = createAtom({
            initialValue: { x: 1 },
            equals: (a, b) => a.x === b.x,
        });

        atom.set({ x: 1 }); // equal by custom fn
        expect(atom.pristine).toBe(true);

        atom.set({ x: 2 });
        expect(atom.pristine).toBe(false);
    });

    test('should reset to initial value', () => {
        const atom = createAtom({ initialValue: 1 });

        atom.set(2);
        expect(atom.value).toBe(2);

        atom.reset();
        expect(atom.value).toBe(1);
        expect(atom.pristine).toBe(true);
    });

    test('should reset to initial value with INITIAL constant', () => {
        const atom = createAtom({ initialValue: 1 });

        atom.set(2);
        atom.reset(AtomicValue.INITIAL);

        expect(atom.value).toBe(1);
        expect(atom.pristine).toBe(true);
    });

    test('should reset to last committed value', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        atom.set(2);
        vi.advanceTimersByTime(500);
        expect(atom.value).toBe(2);

        atom.set(3);
        expect(atom.$value).toBe(3);
        expect(atom.value).toBe(2);

        atom.reset(AtomicValue.LAST);
        expect(atom.value).toBe(2);
        expect(atom.$value).toBe(2);
        expect(atom.stale).toBe(false);
    });

    test('should reset to specific value', () => {
        const atom = createAtom({ initialValue: 1 });

        atom.reset(99);
        expect(atom.value).toBe(99);
        expect(atom.$value).toBe(99);
        expect(atom.pristine).toBe(false);
    });

    test('should reset to first set value for deferred initialization', () => {
        const atom = createAtom<number>({ deferredInitialValue: true });

        atom.set(42);
        atom.set(100);
        atom.reset();

        expect(atom.value).toBe(42); // frozen initial
        expect(atom.pristine).toBe(true);
    });

    test('should cancel pending delay on reset', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        atom.set(2);
        expect(atom.stale).toBe(true);

        atom.reset();
        vi.advanceTimersByTime(500);
        expect(atom.value).toBe(1);
        expect(atom.stale).toBe(false);
    });

    test('should notify subscribers on state changes', () => {
        const listener = vi.fn();
        const atom = createAtom({ initialValue: 1 });
        atom.subscribe(listener);

        atom.set(2);
        expect(listener).toHaveBeenCalledTimes(1);

        atom.reset();
        expect(listener).toHaveBeenCalledTimes(2);
    });

    test('should unsubscribe correctly', () => {
        const listener = vi.fn();
        const atom = createAtom({ initialValue: 1 });
        const unsub = atom.subscribe(listener);

        atom.set(2);
        expect(listener).toHaveBeenCalledTimes(1);

        unsub();
        atom.set(3);
        expect(listener).toHaveBeenCalledTimes(1); // no more calls
    });

    test('should stop notifications after dispose', () => {
        const listener = vi.fn();
        const atom = createAtom({ initialValue: 1 });
        atom.subscribe(listener);

        atom.dispose();

        atom.set(2);
        expect(listener).not.toHaveBeenCalled();
        expect(atom.value).toBe(1); // unchanged
    });

    test('should reconfigure equality function', () => {
        const atom = createAtom({ initialValue: { x: 1 } });

        atom.set({ x: 1 }); // different ref, Object.is → not equal
        expect(atom.pristine).toBe(false);

        atom.reset();
        atom.reconfigure({ equals: (a, b) => a.x === b.x });

        atom.set({ x: 1 }); // same content, custom fn → equal (dedup)
        expect(atom.pristine).toBe(true);
    });

    test('should reconfigure delay', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        atom.reconfigure({ delay: 100 });
        atom.set(2);

        vi.advanceTimersByTime(100);
        expect(atom.value).toBe(2);
    });

    test('should equals compare against committed value', () => {
        const atom = createAtom({ initialValue: 1, delay: 500 });

        expect(atom.equals(1)).toBe(true);
        expect(atom.equals(2)).toBe(false);

        atom.set(2); // pending
        expect(atom.equals(1)).toBe(true); // still committed = 1
        expect(atom.equals(2)).toBe(false);

        vi.advanceTimersByTime(500);
        expect(atom.equals(2)).toBe(true); // now committed = 2
    });

    test('should compute derived state directly from source of truth', () => {
        const equalsFn = vi.fn(Object.is);
        const atom = createAtom({ initialValue: 1, equals: equalsFn });

        // Each stale access computes directly — no version-based caching
        equalsFn.mockClear();
        expect(atom.stale).toBe(false);
        expect(atom.stale).toBe(false);
        expect(atom.stale).toBe(false);

        // One call per access (comparing committed vs latest)
        expect(equalsFn).toHaveBeenCalledTimes(3);
    });
});
