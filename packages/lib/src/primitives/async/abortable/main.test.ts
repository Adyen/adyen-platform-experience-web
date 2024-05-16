import { describe, expect, test } from 'vitest';
import { getPromiseState, PromiseState } from '../../utils';
import { createAbortable } from './main';

describe('createAbortable', () => {
    test('should create abortable', async () => {
        const abortable = createAbortable('aborted' as const);

        expect(abortable.reason).toBe('aborted');
        expect(abortable.signal.aborted).toBe(false);
        expect(await getPromiseState(abortable.promise)).toBe(PromiseState.PENDING);

        // abort abortable
        abortable.abort();
        expect(abortable.signal.aborted).toBe(true);
        expect(await getPromiseState(abortable.promise)).toBe(PromiseState.REJECTED);

        // refresh abortable
        abortable.refresh();
        expect(abortable.signal.aborted).toBe(false);
        expect(await getPromiseState(abortable.promise)).toBe(PromiseState.PENDING);
    });

    test('should return same object on refresh', () => {
        const abortable = createAbortable();
        expect(abortable.refresh()).toBe(abortable);
    });

    test('should only refresh abortable if necessary', async () => {
        const abortable = createAbortable();
        const { promise, reason, signal } = abortable.refresh();

        expect(abortable.promise).toBe(promise);
        expect(abortable.reason).toBe(reason);
        expect(abortable.signal).toBe(signal);

        // abort abortable
        abortable.abort();
        expect(abortable.promise).toBe(promise);
        expect(abortable.signal).toBe(signal);

        // refresh abortable
        abortable.refresh();
        expect(abortable.promise).not.toBe(promise);
        expect(abortable.signal).not.toBe(signal);
    });
});
