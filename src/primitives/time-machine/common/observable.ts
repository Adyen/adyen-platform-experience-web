import { enumerable, identity, isFunction } from '../../../utils';

export interface Observable<T> {
    (callback: (value: T) => unknown, signal?: AbortSignal): void;
    readonly end: () => void;
    readonly signal: AbortSignal;
}

export const createObservable = <T, TTransform = T>(
    source: () => Iterable<T> | AsyncIterable<T>,
    transform = identity as (currentValue: T) => TTransform
): Observable<TTransform> => {
    type TValue = TTransform | typeof suspensionToken;

    let activeIterators = 0;
    let controller = new AbortController();
    let valuePromise: Promise<TValue>;
    let valuePromiseResolve: (value: TValue | PromiseLike<TValue>) => void;

    const suspensionToken: unique symbol = Symbol();

    let end = () => {
        controller?.abort();
        controller = end = iterator = refreshValuePromise = startIterator = valuePromise = valuePromiseResolve = null!;
    };

    let iterator = async function* () {
        try {
            activeIterators++ || startIterator();
            while (true) {
                const value = await valuePromise;
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
            if (value) refreshValuePromise();
            else valuePromise = valuePromiseResolve = null!;
        });
    };

    let startIterator = () => {
        refreshValuePromise();
        (async () => {
            for await (const currentValue of source()) {
                valuePromiseResolve?.(transform(currentValue));
            }
        })();
    };

    const subscribe = ((callback: (value: TTransform) => unknown, signal?: AbortSignal) => {
        if (!isFunction(callback)) throw new TypeError('Expects callback value to be callable');

        if (signal instanceof AbortSignal) {
            if (signal.aborted) return;
            signal.addEventListener('abort', () => void (aborted = true), { once: true });
        }

        let aborted = false;

        (async () => {
            for await (const value of iterator()) {
                if (aborted) break;
                callback(value);
            }
        })();
    }) as Observable<TTransform>;

    return Object.defineProperties(subscribe, {
        end: enumerable(() => end?.()),
        signal: enumerable(controller.signal),
    });
};

export default createObservable;
