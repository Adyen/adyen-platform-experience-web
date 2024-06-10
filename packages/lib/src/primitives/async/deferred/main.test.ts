import { describe, expect, test, vi } from 'vitest';
import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../utils';
import { PromiseState } from '../../../utils/types';
import { createDeferred } from './main';

describe('createDeferred', () => {
    const UNCAUGHT_EXCEPTION = 'uncaught_exception';
    const UNKNOWN_ERROR = 'unknown_error';

    const throw_unknown_error = () => {
        throw UNKNOWN_ERROR;
    };

    test('should use passthrough promise callbacks by default', async () => {
        const deferred = createDeferred(); // will use passthrough promise callbacks
        let currentPromise = deferred.promise;

        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        // resolve current promise
        deferred.resolve(5);
        expect(await currentPromise).toBe(5);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);

        // refresh deferred
        currentPromise = deferred.refresh().promise;
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        const data = { message: 'Hello world!' };

        // resolve current promise
        deferred.resolve(data);
        expect(await currentPromise).toBe(data);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.FULFILLED);

        // refresh deferred
        currentPromise = deferred.refresh().promise;
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        // reject current promise
        deferred.reject(UNCAUGHT_EXCEPTION);
        await expect(async () => currentPromise).rejects.toThrowError(UNCAUGHT_EXCEPTION);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.REJECTED);

        // refresh deferred
        currentPromise = deferred.refresh().promise;
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.PENDING);

        const error = new Error(UNKNOWN_ERROR);

        // reject current promise
        deferred.reject(error);
        await expect(async () => currentPromise).rejects.toThrowError(error);
        expect(await getPromiseState(currentPromise)).toBe(PromiseState.REJECTED);
    });

    test('should resolve promise only once until refresh', async () => {
        const thenCallback = vi.fn(<T>(value: T) => typeof value);
        const deferred = createDeferred(thenCallback);

        // deferred promise not yet resolved
        expect(thenCallback).toBeCalledTimes(0);
        expect(await getPromiseState(deferred.promise)).toBe(PromiseState.PENDING);

        // resolve current promise
        deferred.resolve(5);

        // wait for next tick
        await ALREADY_RESOLVED_PROMISE;

        // deferred promise already fulfilled
        expect(thenCallback).toBeCalledTimes(1);
        expect(thenCallback).toHaveBeenLastCalledWith(5);
        expect(await deferred.promise).toBe('number'); // typeof 5 => 'number'
        expect(await getPromiseState(deferred.promise)).toBe(PromiseState.FULFILLED);

        // ignored resolves
        deferred.resolve(10);
        deferred.resolve([20]);
        deferred.resolve('100');

        expect(thenCallback).toBeCalledTimes(1);
        expect(thenCallback).toHaveBeenLastCalledWith(5);
        expect(await deferred.promise).toBe('number'); // typeof 5 => 'number'

        // refresh promise
        const currentPromise = deferred.promise;
        const nextPromise = deferred.refresh().promise;

        expect(deferred.promise).toBe(nextPromise);
        expect(deferred.promise).not.toBe(currentPromise);
        expect(await getPromiseState(deferred.promise)).toBe(PromiseState.PENDING);
    });

    test('should reject promise only once until refresh', async () => {
        const catchCallback = vi.fn(throw_unknown_error);
        const deferred = createDeferred(void 0, catchCallback);

        // deferred promise not yet resolved
        expect(catchCallback).toBeCalledTimes(0);
        expect(await getPromiseState(deferred.promise)).toBe(PromiseState.PENDING);

        // reject current promise
        deferred.reject(UNCAUGHT_EXCEPTION);

        // catchCallback => throws <UNKNOWN_ERROR>
        await expect(async () => deferred.promise).rejects.toThrowError(UNKNOWN_ERROR);

        // deferred promise already rejected
        expect(catchCallback).toBeCalledTimes(1);
        expect(catchCallback).toHaveBeenLastCalledWith(UNCAUGHT_EXCEPTION);
        expect(await getPromiseState(deferred.promise)).toBe(PromiseState.REJECTED);

        // ignored rejects
        deferred.reject();
        deferred.reject(new Error(UNKNOWN_ERROR));
        deferred.reject('another_exception');

        expect(catchCallback).toBeCalledTimes(1);
        expect(catchCallback).toHaveBeenLastCalledWith(UNCAUGHT_EXCEPTION);

        // refresh promise
        const currentPromise = deferred.promise;
        const nextPromise = deferred.refresh().promise;

        expect(deferred.promise).toBe(nextPromise);
        expect(deferred.promise).not.toBe(currentPromise);
        expect(await getPromiseState(deferred.promise)).toBe(PromiseState.PENDING);
    });

    test('should chain pending promises on refresh', async () => {
        let catchCallbackCalls = 0;
        let thenCallbackCalls = 0;

        const PROMISES = Array(3).fill(ALREADY_RESOLVED_PROMISE) as [Promise<number>, Promise<number>, Promise<number>];

        const catchCallback = vi.fn(throw_unknown_error);
        const thenCallback = vi.fn((value: number) => value * value);
        const deferred = createDeferred(thenCallback, catchCallback);

        const refreshPromises = async () => {
            PROMISES.forEach((_, index) => {
                PROMISES[index] = deferred.refresh().promise;
            });

            const [firstPromise, secondPromise, latestPromise] = PROMISES;

            expect(latestPromise).toBe(deferred.promise);
            expect(latestPromise).not.toBe(secondPromise);
            expect(secondPromise).not.toBe(firstPromise);

            // deferred promise not yet resolved
            expect(catchCallback).toBeCalledTimes(catchCallbackCalls);
            expect(thenCallback).toBeCalledTimes(thenCallbackCalls);

            for (const promise of PROMISES) {
                expect(await getPromiseState(promise)).toBe(PromiseState.PENDING);
            }
        };

        // refresh deferred
        await refreshPromises();

        // resolve current promise
        deferred.resolve(5);

        for (const promise of PROMISES) {
            expect(await promise).toBe(25); // (thenCallback => 5 * 5)
            expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
        }

        expect(catchCallback).toBeCalledTimes(catchCallbackCalls);
        expect(thenCallback).toBeCalledTimes(++thenCallbackCalls);
        expect(thenCallback).toHaveBeenLastCalledWith(5);

        // refresh deferred
        await refreshPromises();

        // reject current promise
        deferred.reject(UNCAUGHT_EXCEPTION);

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
        const deferred = createDeferred();
        expect(deferred.refresh()).toBe(deferred);
    });
});
