import { describe, expect, test, vi } from 'vitest';
import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../utils';
import { PromiseState } from '../../../utils/types';
import { createPromisor } from './main';

describe('createPromisor', () => {
    const UNCAUGHT_EXCEPTION = 'uncaught_exception';
    const UNKNOWN_ERROR = 'unknown_error';

    const throw_unknown_error = () => {
        throw UNKNOWN_ERROR;
    };

    test('should use passthrough promise callbacks by default', async () => {
        const promisor = createPromisor(); // will use passthrough promise callbacks
        let currentPromise = promisor.promise;

        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        // resolve current promise
        promisor.resolve(5);
        expect(await currentPromise).toBe(5);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);

        // refresh promisor
        currentPromise = promisor.refresh().promise;
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        const data = { message: 'Hello world!' };

        // resolve current promise
        promisor.resolve(data);
        expect(await currentPromise).toBe(data);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);

        // refresh promisor
        currentPromise = promisor.refresh().promise;
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        // reject current promise
        promisor.reject(UNCAUGHT_EXCEPTION);
        await expect(async () => currentPromise).rejects.toThrowError(UNCAUGHT_EXCEPTION);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.REJECTED);

        // refresh promisor
        currentPromise = promisor.refresh().promise;
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        const error = new Error(UNKNOWN_ERROR);

        // reject current promise
        promisor.reject(error);
        await expect(async () => currentPromise).rejects.toThrowError(error);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.REJECTED);
    });

    test('should resolve promise only once until refresh', async () => {
        const thenCallback = vi.fn(<T>(value: T) => typeof value);
        const promisor = createPromisor(thenCallback);

        // promisor promise not yet resolved
        expect(thenCallback).toBeCalledTimes(0);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);

        // resolve current promise
        promisor.resolve(5);

        // wait for next tick
        await ALREADY_RESOLVED_PROMISE;

        // promisor promise already fulfilled
        expect(thenCallback).toBeCalledTimes(1);
        expect(thenCallback).toHaveBeenLastCalledWith(5);
        expect(await promisor.promise).toBe('number'); // typeof 5 => 'number'
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.FULFILLED);

        // ignored resolves
        promisor.resolve(10);
        promisor.resolve([20]);
        promisor.resolve('100');

        expect(thenCallback).toBeCalledTimes(1);
        expect(thenCallback).toHaveBeenLastCalledWith(5);
        expect(await promisor.promise).toBe('number'); // typeof 5 => 'number'

        // refresh promise
        const currentPromise = promisor.promise;
        const nextPromise = promisor.refresh().promise;

        expect(promisor.promise).toBe(nextPromise);
        expect(promisor.promise).not.toBe(currentPromise);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);
    });

    test('should reject promise only once until refresh', async () => {
        const catchCallback = vi.fn(throw_unknown_error);
        const promisor = createPromisor(void 0, catchCallback);

        // promisor promise not yet resolved
        expect(catchCallback).toBeCalledTimes(0);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);

        // reject current promise
        promisor.reject(UNCAUGHT_EXCEPTION);

        // catchCallback => throws <UNKNOWN_ERROR>
        await expect(async () => promisor.promise).rejects.toThrowError(UNKNOWN_ERROR);

        // promisor promise already rejected
        expect(catchCallback).toBeCalledTimes(1);
        expect(catchCallback).toHaveBeenLastCalledWith(UNCAUGHT_EXCEPTION);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.REJECTED);

        // ignored rejects
        promisor.reject();
        promisor.reject(new Error(UNKNOWN_ERROR));
        promisor.reject('another_exception');

        expect(catchCallback).toBeCalledTimes(1);
        expect(catchCallback).toHaveBeenLastCalledWith(UNCAUGHT_EXCEPTION);

        // refresh promise
        const currentPromise = promisor.promise;
        const nextPromise = promisor.refresh().promise;

        expect(promisor.promise).toBe(nextPromise);
        expect(promisor.promise).not.toBe(currentPromise);
        expect(await getPromiseState(promisor.promise)).toBe(PromiseState.PENDING);
    });

    test('should chain pending promises on refresh', async () => {
        let catchCallbackCalls = 0;
        let thenCallbackCalls = 0;

        const PROMISES = Array(3).fill(ALREADY_RESOLVED_PROMISE) as [Promise<number>, Promise<number>, Promise<number>];

        const catchCallback = vi.fn(throw_unknown_error);
        const thenCallback = vi.fn((value: number) => value * value);
        const promisor = createPromisor<number>(thenCallback, catchCallback);

        const refreshPromises = async () => {
            PROMISES.forEach((_, index) => {
                PROMISES[index] = promisor.refresh().promise;
            });

            const [firstPromise, secondPromise, latestPromise] = PROMISES;

            expect(latestPromise).toBe(promisor.promise);
            expect(latestPromise).not.toBe(secondPromise);
            expect(secondPromise).not.toBe(firstPromise);

            // promisor promise not yet resolved
            expect(catchCallback).toBeCalledTimes(catchCallbackCalls);
            expect(thenCallback).toBeCalledTimes(thenCallbackCalls);

            for (const promise of PROMISES) {
                expect(await getPromiseState(promise)).toBe(PromiseState.PENDING);
            }
        };

        // refresh promisor
        await refreshPromises();

        // resolve current promise
        promisor.resolve(5);

        for (const promise of PROMISES) {
            expect(await promise).toBe(25); // (thenCallback => 5 * 5)
            expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
        }

        expect(catchCallback).toBeCalledTimes(catchCallbackCalls);
        expect(thenCallback).toBeCalledTimes(++thenCallbackCalls);
        expect(thenCallback).toHaveBeenLastCalledWith(5);

        // refresh promisor
        await refreshPromises();

        // reject current promise
        promisor.reject(UNCAUGHT_EXCEPTION);

        for (const promise of PROMISES) {
            // catchCallback => throws <UNKNOWN_ERROR>
            await expect(async () => promise).rejects.toThrowError(UNKNOWN_ERROR);
            expect(await getPromiseState(promise)).toBe(PromiseState.REJECTED);
        }

        expect(thenCallback).toBeCalledTimes(thenCallbackCalls);
        expect(catchCallback).toBeCalledTimes(++catchCallbackCalls);
        expect(catchCallback).toHaveBeenLastCalledWith(UNCAUGHT_EXCEPTION);
    });

    test('should return same object on refresh', () => {
        const promisor = createPromisor();
        expect(promisor.refresh()).toBe(promisor);
    });
});
