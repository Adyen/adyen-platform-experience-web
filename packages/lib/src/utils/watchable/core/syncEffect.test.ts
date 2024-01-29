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

    test<TestEffect>('should call effect once (synchronously)', ({ chain, effect }) => {
        const chainedFn1 = chain(vi.fn());
        const chainedFn2 = chain(vi.fn());

        expect(effect).toBeCalledTimes(0);

        chainedFn1();
        expect(effect).toBeCalledTimes(1);

        chainedFn2();
        expect(effect).toBeCalledTimes(2);

        (() => {
            chainedFn1();
            chainedFn2();
            chainedFn1();
            chainedFn2();
            chainedFn1();
            chainedFn1();
        })();

        expect(effect).toBeCalledTimes(8);

        chain(() => {
            chainedFn1();
            chainedFn2();
            chainedFn1();
            chainedFn2();
            chainedFn1();
            chainedFn1();
        })();

        expect(effect).toBeCalledTimes(9);
    });
});
