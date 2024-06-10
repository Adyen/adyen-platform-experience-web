import { describe, expect, test, vi } from 'vitest';
import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../utils';
import { PromiseState } from '../../../utils/types';
import { createPromisor } from './main';

describe('createPromisor', () => {
    test('should return a promisor function', async () => {
        const promisor = createPromisor(() => {});
        const { abort, promise } = promisor;

        expect(promisor).toBeTypeOf('function');
        expect(abort).toBeTypeOf('function');
        expect(promise).toBeInstanceOf(Promise);

        expect(await getPromiseState(promise)).toBe(PromiseState.PENDING);
    });

    test('should return unique promise for every call and autorefresh promise after last call', async () => {
        vi.useFakeTimers();

        const promisor = createPromisor((_, delay: number = 0) => new Promise<void>(resolve => setTimeout(resolve, delay)));
        const { promise } = promisor;

        expect(promisor.promise).toBe(promise);
        expect(await getPromiseState(promise)).toBe(PromiseState.PENDING);

        const promise1 = promisor();
        const promise2 = promisor(200);
        const promise3 = promisor(100);

        expect(promise1).not.toBe(promise2);
        expect(promise1).not.toBe(promise3);

        await vi.advanceTimersByTimeAsync(150);

        expect(await getPromiseState(promise1)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(promise2)).toBe(PromiseState.PENDING);
        expect(await getPromiseState(promise3)).toBe(PromiseState.FULFILLED);

        expect(promisor.promise).not.toBe(promise);
        expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);

        await vi.advanceTimersByTimeAsync(100);
        expect(await getPromiseState(promise2)).toBe(PromiseState.FULFILLED);
        vi.useRealTimers();
    });
});
