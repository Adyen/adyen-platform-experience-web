import { beforeEach, describe, expect, test, vi } from 'vitest';
import createSyncEffectChain from './syncEffect';

describe('createSyncEffectChain', () => {
    type TestEffect = {
        effect: NonNullable<Parameters<typeof createSyncEffectChain>[0]>;
        chain: ReturnType<typeof createSyncEffectChain>;
    };

    beforeEach<TestEffect>(context => {
        const effect = vi.fn();

        Object.defineProperties(context, {
            chain: { enumerable: true, value: createSyncEffectChain(effect) },
            effect: { enumerable: true, value: effect },
        });
    });

    test<TestEffect>('should preserve the return value of the outermost function in the chain', ({ chain }) => {
        const chainedFn1 = chain(() => (RANDOM = Math.random()));
        const chainedFn2 = chain(value => !!value);
        let RANDOM = Math.random();

        expect(chainedFn1()).toBe(RANDOM);
        expect(chainedFn2('hello')).toBe(true);
        expect(chainedFn2(-0)).toBe(false);

        const chainedFn3 = chain((value?: any) => {
            const boolValue = chainedFn2(value);
            if (boolValue) return chainedFn1();
            return value == undefined ? value : boolValue;
        });

        expect(chainedFn3()).toBe(undefined);
        expect(chainedFn3(null)).toBe(null);
        expect(chainedFn3(NaN)).toBe(false);
        expect(chainedFn3('')).toBe(false);
        expect(chainedFn3({})).toBe(RANDOM);
        expect(chainedFn3('hello')).toBe(RANDOM);
    });

    test<TestEffect>('should call effect once (synchronously) at the end of the chain', ({ chain, effect }) => {
        const chainedFn1 = chain(vi.fn());
        const chainedFn2 = chain(vi.fn());

        expect(effect).toBeCalledTimes(0); // not called yet

        chainedFn1(); // end of chain
        expect(effect).toBeCalledTimes(1); // called once

        chainedFn2(); // end of chain
        expect(effect).toBeCalledTimes(2); // called once

        (() => {
            chainedFn1(); // end of chain (called once)
            chainedFn2(); // end of chain (called once)
            chainedFn1(); // end of chain (called once)
            chainedFn2(); // end of chain (called once)
            chainedFn1(); // end of chain (called once)
            chainedFn1(); // end of chain (called once)
        })();

        expect(effect).toBeCalledTimes(8); // called 6 additional times in the IIFE

        chain(() => {
            chainedFn1(); // not end of chain
            chainedFn2(); // not end of chain
            chainedFn1(); // not end of chain
            chainedFn2(); // not end of chain
            chainedFn1(); // not end of chain
            chainedFn1(); // not end of chain
        })(); // end of chain

        expect(effect).toBeCalledTimes(9); // called once

        chainedFn1(); // end of chain
        expect(effect).toBeCalledTimes(10); // called once

        chain(() => {
            chainedFn1(); // not called
            chainedFn2(); // not called
            chainedFn1(); // not called
        })(); // end of chain

        expect(effect).toBeCalledTimes(11); // called once

        chainedFn2(); // end of chain
        expect(effect).toBeCalledTimes(12); // called once
    });

    test<TestEffect>('should not call effect when there is uncaught exception within the chain', async ({ chain, effect }) => {
        const chainedFn1 = chain(() => (RANDOM = Math.random()));
        const chainedFn2 = chain(value => !!value);

        let EXCEPTION = 'uncaught_exception';
        let RANDOM = Math.random();
        let COUNTER = 0;

        expect(chainedFn1()).toBe(RANDOM);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        expect(chainedFn2('hello')).toBe(true);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        expect(chainedFn2(-0)).toBe(false);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        const chainedFn3 = chain((value?: any) => {
            const boolValue = chainedFn2(value);

            if (boolValue) return chainedFn1();
            if (value == undefined) return value;
            if (chainedFn1() < 0.5) return boolValue;

            throw EXCEPTION;
        });

        expect(chainedFn3()).toBe(undefined);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        for await (const value of [false, 0, NaN, '']) {
            try {
                // may throw exception
                await expect(async () => chainedFn3(value)).rejects.toThrowError(EXCEPTION);

                // if there is uncaught exception, effect will not be called
                expect(effect).toBeCalledTimes(COUNTER);
            } catch {
                // there was no uncaught exception at the end of the chain
                // hence effect will be called once at the end of the chain
                expect(effect).toBeCalledTimes(++COUNTER);
            }
        }

        expect(chainedFn3('hello')).toBe(RANDOM);
        expect(effect).toBeCalledTimes(++COUNTER); // called once
    });
});
