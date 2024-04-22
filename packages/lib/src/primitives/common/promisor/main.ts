import { enumerable, getter, identity, isFunction, noop, struct } from '@src/utils/common';
import type { Promisor } from './types';

export const createPromisor = <T>(thenCallback?: (value: T) => T | PromiseLike<T>) => {
    let _promise: Promisor<T>['promise'];
    let _resolve: Promisor<T>['resolve'];
    const _callback: NonNullable<typeof thenCallback> = isFunction(thenCallback) ? thenCallback : identity;

    const _refresh = () => {
        const previousResolve = _resolve ?? noop;

        const currentPromise = new Promise<T>(resolve => (_resolve = resolve)).then(value => {
            if (currentPromise === _promise) {
                return _callback(value);
            }
            return identity(value);
        });

        previousResolve((_promise = currentPromise));
    };

    _refresh();

    return struct({
        promise: getter(() => _promise),
        refresh: enumerable(_refresh),
        resolve: getter(() => _resolve),
    }) as Promisor<T>;
};

export default createPromisor;
