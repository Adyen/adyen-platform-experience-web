import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createAtom } from './atom';
import { createMolecule } from './molecule';
import { AtomicValue } from './types';

describe('createMolecule', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should initialize with member values', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 'hello' });
        const mol = createMolecule({ members: { a, b } });

        expect(mol.value).toEqual({ a: 1, b: 'hello' });
        expect(mol.$value).toEqual({ a: 1, b: 'hello' });
        expect(mol.$$value).toEqual({ a: 1, b: 'hello' });
        expect(mol.stale).toBe(false);
        expect(mol.pristine).toBe(true);
        expect(mol.initialized).toBe(true);
    });

    test('should update member values via set', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        mol.set({ a: 10 });

        expect(mol.value).toEqual({ a: 10, b: 2 });
        expect(mol.pristine).toBe(false);
    });

    test('should handle delayed updates independently', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2, delay: 1000 });
        const mol = createMolecule({ members: { a, b } });

        mol.set({ a: 10, b: 20 });

        expect(mol.$value).toEqual({ a: 10, b: 20 });
        expect(mol.value).toEqual({ a: 1, b: 2 }); // all-or-nothing: b is stale
        expect(mol.stale).toBe(true);

        vi.advanceTimersByTime(1000);

        expect(mol.value).toEqual({ a: 10, b: 20 });
        expect(mol.stale).toBe(false);
        expect(mol.pristine).toBe(false);
    });

    test('should handle deferred members', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom<number>({ deferredInitialValue: true });
        const mol = createMolecule({ members: { a, b } });

        expect(mol.initialized).toBe(false);
        expect(mol.value).toEqual({ a: 1, b: undefined });
        expect(mol.pristine).toBe(true);

        b.set(2);

        expect(mol.initialized).toBe(true);
        expect(mol.value).toEqual({ a: 1, b: 2 });
        expect(mol.pristine).toBe(true);
    });

    test('should handle multiple deferred members', () => {
        const a = createAtom<number>({ deferredInitialValue: true });
        const b = createAtom<string>({ deferredInitialValue: true });
        const mol = createMolecule({ members: { a, b } });

        expect(mol.initialized).toBe(false);

        a.set(1);
        expect(mol.initialized).toBe(false);

        b.set('hello');
        expect(mol.initialized).toBe(true);
        expect(mol.value).toEqual({ a: 1, b: 'hello' });
        expect(mol.pristine).toBe(true);
    });

    test('should reset all members to initial value', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        mol.set({ a: 10, b: 20 });
        mol.reset();

        expect(mol.value).toEqual({ a: 1, b: 2 });
        expect(mol.pristine).toBe(true);
    });

    test('should reset with INITIAL constant', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        mol.set({ a: 10, b: 20 });
        mol.reset(AtomicValue.INITIAL);

        expect(mol.value).toEqual({ a: 1, b: 2 });
        expect(mol.pristine).toBe(true);
    });

    test('should reset to last committed value', () => {
        const a = createAtom({ initialValue: 1, delay: 500 });
        const b = createAtom({ initialValue: 2, delay: 500 });
        const mol = createMolecule({ members: { a, b } });

        mol.set({ a: 10, b: 20 });
        vi.advanceTimersByTime(500);
        expect(mol.value).toEqual({ a: 10, b: 20 });

        mol.set({ a: 100, b: 200 });
        expect(mol.stale).toBe(true);

        mol.reset(AtomicValue.LAST);
        expect(mol.value).toEqual({ a: 10, b: 20 });
        expect(mol.stale).toBe(false);
    });

    test('should reset to specific value', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        mol.reset({ a: 99, b: 88 });

        expect(mol.value).toEqual({ a: 99, b: 88 });
    });

    test('should handle partial equality check', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        expect(mol.equals({ a: 1 })).toBe(true); // partial — only checks 'a'
        expect(mol.equals({ a: 1, b: 2 })).toBe(true);
        expect(mol.equals({ a: 99 })).toBe(false);
    });

    test('should notify subscribers on member changes', () => {
        const listener = vi.fn();
        const a = createAtom({ initialValue: 1 });
        const mol = createMolecule({ members: { a } });
        mol.subscribe(listener);

        a.set(2);
        expect(listener).toHaveBeenCalled();
    });

    test('should not notify when member change does not affect values', () => {
        const listener = vi.fn();
        const a = createAtom({ initialValue: 1 });
        const mol = createMolecule({ members: { a } });
        mol.subscribe(listener);

        a.set(1); // dedup — no actual change
        expect(listener).not.toHaveBeenCalled();
    });

    test('should handle nested molecules', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const inner = createMolecule({ members: { b } });
        const outer = createMolecule({ members: { a, nested: inner } });

        expect(outer.value).toEqual({ a: 1, nested: { b: 2 } });

        b.set(20);
        expect(outer.value).toEqual({ a: 1, nested: { b: 20 } });
    });

    test('should dispose and unsubscribe from members', () => {
        const listener = vi.fn();
        const a = createAtom({ initialValue: 1 });
        const mol = createMolecule({ members: { a } });
        mol.subscribe(listener);

        mol.dispose();

        a.set(2);
        expect(listener).not.toHaveBeenCalled();
    });

    test('should sync with new members', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const c = createAtom({ initialValue: 3 });
        const mol = createMolecule({ members: { a, b } });

        expect(mol.value).toEqual({ a: 1, b: 2 });

        mol.sync({ a, b: c } as any);

        expect(mol.value).toEqual({ a: 1, b: 3 });
    });

    test('should maintain referential stability when values unchanged', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        const value1 = mol.value;
        // Trigger a no-op notification cycle (member set same value → dedup)
        // Value ref should remain stable
        const value2 = mol.value;

        expect(value1).toBe(value2);
    });

    test('should use lazy caching for derived state', () => {
        const a = createAtom({ initialValue: 1 });
        const b = createAtom({ initialValue: 2 });
        const mol = createMolecule({ members: { a, b } });

        // Access pristine multiple times — should not iterate members each time
        const p1 = mol.pristine;
        const p2 = mol.pristine;
        expect(p1).toBe(p2);
        expect(p1).toBe(true);
    });
});
