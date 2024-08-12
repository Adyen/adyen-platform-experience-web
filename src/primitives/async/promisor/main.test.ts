import { describe, expect, test, vi } from 'vitest';
import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../utils';
import { PromiseState } from '../../../utils/types';
import { createPromisor } from './main';

describe('createPromisor', () => {
    test('should return unique promise for every promisor call', async () => {
        vi.useFakeTimers();

        const promisor = createPromisor((_, delay: number = 0) => new Promise<void>(resolve => setTimeout(resolve, delay)));
        const currentPromise = promisor.promise;

        expect(promisor.promise).toBe(currentPromise);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        const promise1 = promisor();
        const promise2 = promisor(200);
        const promise3 = promisor(100);

        expect(promise1).not.toBe(promise2);
        expect(promise1).not.toBe(promise3);

        await vi.advanceTimersByTimeAsync(150);

        expect(await getPromiseState(promise1)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(promise2)).toBe(PromiseState.PENDING);
        expect(await getPromiseState(promise3)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);

        await vi.advanceTimersByTimeAsync(100);
        expect(await getPromiseState(promise2)).toBe(PromiseState.FULFILLED);
        vi.useRealTimers();
    });

    test('should pass a unique abort signal for every promisor call and abort previous signals', () => {
        const SIGNALS: AbortSignal[] = [];

        const promisor = createPromisor(signal => SIGNALS.push(signal));
        const promise1 = promisor();
        const promise2 = promisor();
        const promise3 = promisor();

        expect(promise1).not.toBe(promise2);
        expect(promise1).not.toBe(promise3);

        for (let i = 1; i < SIGNALS.length; i++) {
            expect(SIGNALS[i]).not.toBe(SIGNALS[i - 1]);
            // only the signal for the latest promisor call will not be aborted
            expect(SIGNALS[i]?.aborted).toBe(i !== SIGNALS.length - 1);
        }

        // abort the signal for the latest promisor call
        promisor.abort();

        expect(SIGNALS[SIGNALS.length - 1]?.aborted).toBe(true);
    });

    test('should not abort signal unnecessarily when there is only one running promisor call', async () => {
        const SIGNALS: AbortSignal[] = [];
        const promisor = createPromisor(signal => SIGNALS.push(signal));

        for (let i = 0; i < 3; i++) {
            // only one running promisor call
            // wait for its promise to be settled
            await promisor();

            if (i > 1) {
                // always same signal as previous
                expect(SIGNALS[i]).toBe(SIGNALS[i - 1]);
            }

            // same signal as before (not aborted)
            expect(SIGNALS[i]?.aborted).toBe(false);
        }

        // abort the signal
        promisor.abort();

        // each element of SIGNALS is a reference to the same signal
        // and that signal is now aborted
        SIGNALS.forEach(signal => expect(signal.aborted).toBe(true));
    });

    test('should fulfill its promise with the same value as the last promise returned by promisor', async () => {
        let factoryCalls = 0;

        const factory = vi.fn((_, value: number) => value);
        const promisor = createPromisor(factory);
        const currentPromise = promisor.promise;

        const promisesMap = new Map(
            [1, 2, 3, 4, 5].map(n => {
                const callback = vi.fn();
                const promise = promisor(n);

                expect(factory).toHaveBeenCalledTimes(++factoryCalls);
                expect(factory.mock.lastCall?.[1]).toBe(n);

                promise.then(callback);
                return [promise, [callback, n] as const] as const;
            })
        );

        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        await (async () => {
            for await (const [promise, [callback, n]] of promisesMap) {
                expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
                expect(callback).toHaveBeenCalledOnce();
                expect(callback).toHaveBeenLastCalledWith(n);
                expect(await promise).toBe(n);
            }
        })();

        // current promise resolved with last promise value
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);
        expect(await currentPromise).toBe(factory.mock.lastCall?.[1]);

        // refresh promisor
        promisor.refresh();

        expect(promisor.promise).not.toBe(currentPromise);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);
    });

    test('should reject its promise with the same reason as the last promise returned by promisor', async () => {
        let factoryCalls = 0;

        const factory = vi.fn().mockImplementation((_, value: any) => {
            throw value;
        });

        const promisor = createPromisor(factory);
        const currentPromise = promisor.promise;

        const promisesMap = new Map(
            ['1', '2', '3', '4', '5'].map(n => {
                const callback = vi.fn();
                const promise = promisor(n);

                expect(factory).toHaveBeenCalledTimes(++factoryCalls);
                expect(factory.mock.lastCall?.[1]).toBe(n);

                promise.catch(callback);
                return [promise, [callback, n] as const] as const;
            })
        );

        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        await (async () => {
            for await (const [promise, [callback, n]] of promisesMap) {
                expect(await getPromiseState(promise)).toBe(PromiseState.REJECTED);
                expect(callback).toHaveBeenCalledOnce();
                expect(callback).toHaveBeenLastCalledWith(n);
                await expect(async () => promise).rejects.toThrowError(n);
            }
        })();

        // current promise rejected with last promise reason
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.REJECTED);
        await expect(async () => currentPromise).rejects.toThrowError(factory.mock.lastCall?.[1]);

        // refresh promisor
        promisor.refresh();

        expect(promisor.promise).not.toBe(currentPromise);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.REJECTED);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);
    });

    test('should have a different unique promise on every refresh of the promisor', async () => {
        const promisor = createPromisor(() => {});
        let currentPromise = promisor.promise;
        let i = 0;

        while (i++ < 5) {
            promisor.refresh();
            expect(promisor.promise).not.toBe(currentPromise);
            expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);
            currentPromise = promisor.promise;
        }
    });

    test('should chain its pending promises on every refresh', async () => {
        let catchCallbackCalls = 0;
        let thenCallbackCalls = 0;

        const PROMISES = Array(3).fill(ALREADY_RESOLVED_PROMISE) as [Promise<number>, Promise<number>, Promise<number>];
        const UNCAUGHT_EXCEPTION = 'uncaught_exception';

        const catchCallback = vi.fn();
        const thenCallback = vi.fn();

        const factory = vi
            .fn()
            .mockImplementationOnce(() => {})
            .mockResolvedValueOnce(5)
            .mockImplementation(() => {
                throw UNCAUGHT_EXCEPTION;
            });

        const promisor = createPromisor(factory);

        const refreshPromises = async () => {
            PROMISES.forEach((_, index) => {
                promisor.refresh();
                PROMISES[index] = promisor.promise;
            });

            const [firstPromise, secondPromise, latestPromise] = PROMISES;

            expect(latestPromise).toBe(promisor.promise);
            expect(latestPromise).not.toBe(secondPromise);
            expect(secondPromise).not.toBe(firstPromise);

            // register callbacks
            latestPromise.then(thenCallback, catchCallback);

            // deferred promise not yet resolved
            expect(catchCallback).toBeCalledTimes(catchCallbackCalls);
            expect(thenCallback).toBeCalledTimes(thenCallbackCalls);

            for (const promise of PROMISES) {
                expect(await getPromiseState(promise)).toBe(PromiseState.PENDING);
            }
        };

        // refresh promises
        await refreshPromises();

        // call promisor a few times
        promisor().catch(() => {}); // [Call 1] => Promise<undefined> (@see `factory`)
        promisor().catch(() => {}); // [Call 2] => Promise<5> (@see `factory`)

        for (const promise of PROMISES) {
            expect(await promise).toBe(5); // [Latest Call] => Promise<5> (@see `factory`)
            expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
        }

        expect(catchCallback).toBeCalledTimes(catchCallbackCalls);
        expect(thenCallback).toBeCalledTimes(++thenCallbackCalls);
        expect(thenCallback).toHaveBeenLastCalledWith(5); // [Latest Call] => Promise<5> (@see `factory`)

        // refresh promises
        await refreshPromises();

        // call promisor a few more times
        promisor().catch(() => {}); // [Call 3] => Reject<UNCAUGHT_EXCEPTION> (@see `factory`)
        promisor().catch(() => {}); // [Call 4] => Reject<UNCAUGHT_EXCEPTION> (@see `factory`)

        for (const promise of PROMISES) {
            await expect(async () => promise).rejects.toThrowError(UNCAUGHT_EXCEPTION);
            expect(await getPromiseState(promise)).toBe(PromiseState.REJECTED);
        }

        expect(thenCallback).toBeCalledTimes(thenCallbackCalls);
        expect(catchCallback).toBeCalledTimes(++catchCallbackCalls);
        expect(catchCallback).toHaveBeenLastCalledWith(UNCAUGHT_EXCEPTION);
    });
});
