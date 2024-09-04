import { enumerable, identity, isFunction } from '../../../../utils';
import type { Emitter } from './types';

function _assertCallback(callback: unknown): asserts callback is Function {
    if (!isFunction(callback)) throw new TypeError('Expects callback argument to be callable');
}

export const createEmitter = <T, TTransform = T>(
    source: () => Iterable<T> | AsyncIterable<T>,
    transform = identity as (currentValue: T) => TTransform
): Emitter<TTransform> => {
    type TValue = TTransform | typeof suspensionToken;

    let activeIterators = 0;
    let controller = new AbortController();
    let valuePromise: Promise<TValue>;
    let valuePromiseResolve: (value: TValue | PromiseLike<TValue>) => void;

    const suspensionToken: unique symbol = Symbol();

    const assertIterator = () => {
        if (!isFunction(iterator)) throw new TypeError('Cannot start new subscription');
    };

    const asyncIterator = () => {
        assertIterator();
        return iterator();
    };

    let end = () => {
        controller?.abort();
        controller = end = iterator = refreshValuePromise = startIterator = valuePromise = valuePromiseResolve = null!;
    };

    let iterator = async function* () {
        try {
            activeIterators++ || startIterator?.();
            while (true) {
                const value = (await valuePromise) ?? suspensionToken;
                if (value === suspensionToken) break;
                yield value;
            }
        } finally {
            --activeIterators || valuePromiseResolve?.(suspensionToken);
        }
    };

    let refreshValuePromise = () => {
        valuePromise = new Promise<TValue>(resolve => void (valuePromiseResolve = resolve)).then(value =>
            !controller || controller.signal.aborted ? suspensionToken : value
        );

        valuePromise.then(value => {
            if (value === suspensionToken) {
                valuePromise = valuePromiseResolve = null!;
            } else refreshValuePromise?.();
        });
    };

    let startIterator = async () => {
        refreshValuePromise?.();

        for await (const currentValue of source()) {
            if (!activeIterators) break;
            valuePromiseResolve?.(transform(currentValue));
        }
    };

    const subscribe = ((callback: (value: TTransform) => unknown, signal?: AbortSignal) => {
        _assertCallback(callback);
        assertIterator();

        if (signal instanceof AbortSignal) {
            if (signal.aborted) return;
            signal.addEventListener('abort', () => void (aborted = true), { once: true });
        }

        let aborted = false;

        (async () => {
            for await (const value of asyncIterator()) {
                if (aborted) break;
                callback(value);
            }
        })();
    }) as Emitter<TTransform>;

    return Object.defineProperties(subscribe, {
        end: enumerable(() => end?.()),
        signal: enumerable(controller.signal),
        [Symbol.asyncIterator]: enumerable(asyncIterator),
    });
};

export default createEmitter;
