import { describe, expect, test, vi } from 'vitest';
import { getPromiseState, tryResolve } from './main';
import { FOREVER_PENDING_PROMISE } from './constants';
import { PromiseState } from './types';

describe('getPromiseState', () => {
    test('should return fulfilled promise for the final state of already resolved promises', async () => {
        expect(await getPromiseState(Promise.resolve())).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(Promise.reject())).toBe(PromiseState.REJECTED);
    });

    test('should return fulfilled promise for the current state of the specified promise', async () => {
        vi.useFakeTimers();

        const willResolvePromise = new Promise(resolve => setTimeout(resolve, 2000));
        const willRejectPromise = new Promise((_, reject) => setTimeout(reject, 5000));

        expect(await getPromiseState(willResolvePromise)).toBe(PromiseState.PENDING);
        expect(await getPromiseState(willRejectPromise)).toBe(PromiseState.PENDING);

        vi.advanceTimersByTime(2000);

        expect(await getPromiseState(willResolvePromise)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(willRejectPromise)).toBe(PromiseState.PENDING);

        vi.runOnlyPendingTimers();

        expect(await getPromiseState(willResolvePromise)).toBe(PromiseState.FULFILLED);
        expect(await getPromiseState(willRejectPromise)).toBe(PromiseState.REJECTED);
    });

    test('should always return promise fulfilled with `"pending"` for forever pending promise', async () => {
        vi.useFakeTimers();
        expect(await getPromiseState(FOREVER_PENDING_PROMISE)).toBe(PromiseState.PENDING);

        vi.advanceTimersByTime(5000);
        expect(await getPromiseState(FOREVER_PENDING_PROMISE)).toBe(PromiseState.PENDING);

        vi.setSystemTime(new Date('2050-12-31 23:59:59.999'));
        expect(await getPromiseState(FOREVER_PENDING_PROMISE)).toBe(PromiseState.PENDING);
    });
});

describe('tryResolve', () => {
    test('should return resolved promise for `fn` without arguments', async () => {
        const OUTPUTS = ['initial_value', 'resolved_value', 'unknown_error', 'uncaught_exception'] as const;

        const fn = vi
            .fn()
            .mockImplementationOnce(() => OUTPUTS[0])
            .mockResolvedValueOnce(OUTPUTS[1])
            .mockRejectedValueOnce(new Error(OUTPUTS[2]))
            .mockImplementationOnce(() => {
                throw OUTPUTS[3];
            });

        let outputIndex = 0;

        expect(await tryResolve(fn)).toBe(OUTPUTS[outputIndex++]);
        expect(await tryResolve(fn)).toBe(OUTPUTS[outputIndex++]);

        await expect(() => tryResolve(fn)).rejects.toThrowError(OUTPUTS[outputIndex++]);
        await expect(() => tryResolve(fn)).rejects.toThrowError(OUTPUTS[outputIndex++]);
    });

    test('should call `fn` with specified arguments and return resolved promise', async () => {
        const fn = vi.fn((...args: any[]) => args.map(value => typeof value));
        const args = [100n, 0xff, 'hello', fn, null, Symbol()] as const;
        const returns = ['bigint', 'number', 'string', 'function', 'object', 'symbol'] as const;

        // Call pattern (1)
        expect(await tryResolve(fn, ...args)).toMatchObject(returns);

        // Call pattern (2)
        expect(await tryResolve(() => fn(...args))).toMatchObject(returns);

        let maybeRejectedPromise: Promise<any>;

        try {
            await expect(async () => {
                maybeRejectedPromise = tryResolve(() =>
                    fn(
                        // This could potentially result in an uncaught exception,
                        // depending on whether `Math.round(Math.random())` evaluates to `0` or `1`.
                        // If no exception is thrown, this will evaluate to: `fn()` => `[]`
                        ((Math.round(Math.random()) && fn) as unknown as any)()
                    )
                );

                return maybeRejectedPromise;
            }).rejects.toThrowError();
        } catch {
            // If execution enters this block, it means the call to `fn` did not
            // result in an uncaught exception as earlier anticipated. Hence, the
            // expectation is modified.

            // Since no exception is thrown, `maybeRejectedPromise` resolves to:
            // `fn(fn())` => `fn([])` => `['object']`
            expect(await maybeRejectedPromise!).toMatchObject(['object']);
        }
    });
});
