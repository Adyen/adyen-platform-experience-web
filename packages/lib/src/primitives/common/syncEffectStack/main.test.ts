import { beforeEach, describe, expect, test, vi } from 'vitest';
import { enumerable } from '@src/utils/common';
import { createSyncEffectStack } from './main';
import type { SyncEffectStack } from './types';

describe('createSyncEffectStack', () => {
    type TestEffect = {
        effect: SyncEffectStack['effect'];
        stack: SyncEffectStack;
    };

    beforeEach<TestEffect>(context => {
        const effect = vi.fn();

        Object.defineProperties(context, {
            effect: enumerable(effect),
            stack: enumerable(createSyncEffectStack(effect)),
        });
    });

    test<TestEffect>('should preserve the return value of the bottommost function in the call stack', ({ stack }) => {
        const boundFn1 = stack.bind(() => (RANDOM = Math.random()));
        const boundFn2 = stack.bind(value => !!value);
        let RANDOM = Math.random();

        expect(boundFn1()).toBe(RANDOM);
        expect(boundFn2('hello')).toBe(true);
        expect(boundFn2(-0)).toBe(false);

        const boundFn3 = stack.bind((value?: any) => {
            const boolValue = boundFn2(value);
            if (boolValue) return boundFn1();
            return value == undefined ? value : boolValue;
        });

        expect(boundFn3()).toBe(undefined);
        expect(boundFn3(null)).toBe(null);
        expect(boundFn3(NaN)).toBe(false);
        expect(boundFn3('')).toBe(false);
        expect(boundFn3({})).toBe(RANDOM);
        expect(boundFn3('hello')).toBe(RANDOM);
    });

    test<TestEffect>('should call effect once (synchronously) when the call stack is empty', ({ effect, stack }) => {
        const boundFn1 = stack.bind(vi.fn());
        const boundFn2 = stack.bind(vi.fn());

        expect(effect).toBeCalledTimes(0); // not called yet

        boundFn1(); // call stack is empty
        expect(effect).toBeCalledTimes(1); // called once

        boundFn2(); // call stack is empty
        expect(effect).toBeCalledTimes(2); // called once

        (() => {
            boundFn1(); // call stack is empty (called once)
            boundFn2(); // call stack is empty (called once)
            boundFn1(); // call stack is empty (called once)
            boundFn2(); // call stack is empty (called once)
            boundFn1(); // call stack is empty (called once)
            boundFn1(); // call stack is empty (called once)
        })();

        expect(effect).toBeCalledTimes(8); // called 6 additional times in the IIFE

        stack.bind(() => {
            boundFn1(); // call stack is not empty
            boundFn2(); // call stack is not empty
            boundFn1(); // call stack is not empty
            boundFn2(); // call stack is not empty
            boundFn1(); // call stack is not empty
            boundFn1(); // call stack is not empty
        })(); // call stack is empty

        expect(effect).toBeCalledTimes(9); // called once

        boundFn1(); // call stack is empty
        expect(effect).toBeCalledTimes(10); // called once

        stack.bind(() => {
            boundFn1(); // not called
            boundFn2(); // not called
            boundFn1(); // not called
        })(); // call stack is empty

        expect(effect).toBeCalledTimes(11); // called once

        boundFn2(); // call stack is empty
        expect(effect).toBeCalledTimes(12); // called once
    });

    test<TestEffect>('should not call effect when there is uncaught exception within the call stack', async ({ effect, stack }) => {
        const boundFn1 = stack.bind(() => (RANDOM = Math.random()));
        const boundFn2 = stack.bind(value => !!value);

        let EXCEPTION = 'uncaught_exception';
        let RANDOM = Math.random();
        let COUNTER = 0;

        expect(boundFn1()).toBe(RANDOM);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        expect(boundFn2('hello')).toBe(true);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        expect(boundFn2(-0)).toBe(false);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        const boundFn3 = stack.bind((value?: any) => {
            const boolValue = boundFn2(value);

            if (boolValue) return boundFn1();
            if (value == undefined) return value;
            if (boundFn1() < 0.5) return boolValue;

            throw EXCEPTION;
        });

        expect(boundFn3()).toBe(undefined);
        expect(effect).toBeCalledTimes(++COUNTER); // called once

        for await (const value of [false, 0, NaN, '']) {
            try {
                // may throw exception
                await expect(async () => boundFn3(value)).rejects.toThrowError(EXCEPTION);

                // if there is uncaught exception, effect will not be called
                expect(effect).toBeCalledTimes(COUNTER);
            } catch {
                // there was no uncaught exception within the call stack
                // hence effect will be called once when the call stack has been emptied
                expect(effect).toBeCalledTimes(++COUNTER);
            }
        }

        expect(boundFn3('hello')).toBe(RANDOM);
        expect(effect).toBeCalledTimes(++COUNTER); // called once
    });
});
