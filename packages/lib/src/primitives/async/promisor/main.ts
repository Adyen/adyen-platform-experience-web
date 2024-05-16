import { enumerable, getter, identity, isFunction, noop, panic, struct } from '../../utils';
import type { Promisor, PromisorCatchCallback, PromisorThenCallback } from './types';

export const createPromisor = <T, K = T>(thenCallback?: PromisorThenCallback<T, K>, catchCallback?: PromisorCatchCallback<T>) => {
    let _promise: Promisor<T, K>['promise'];
    let _reject: Promisor<T, K>['reject'];
    let _resolve: Promisor<T, K>['resolve'];

    const _catchCallback = isFunction<PromisorCatchCallback<T>>(catchCallback) ? catchCallback : panic;
    const _thenCallback = isFunction<PromisorThenCallback<T, K>>(thenCallback) ? thenCallback : (identity as PromisorThenCallback<T, K>);

    const _refreshPromise = () => {
        const previousResolve = _resolve ?? noop;

        const currentPromise = new Promise<K>((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        })
            .then(value => {
                if (currentPromise === _promise) return _thenCallback(value);
                return value as unknown as T;
            })
            .catch(reason => {
                if (currentPromise === _promise) return _catchCallback(reason);
                throw reason;
            });

        previousResolve((_promise = currentPromise) as K);
    };

    const _refresh = () => {
        _refreshPromise();
        return promisor;
    };

    const promisor = struct({
        promise: getter(() => _promise),
        refresh: enumerable(_refresh),
        reject: enumerable((reason => _reject(reason)) as Promisor<T, K>['reject']),
        resolve: enumerable((value => _resolve(value)) as Promisor<T, K>['resolve']),
    }) as Promisor<T, K>;

    return _refresh();
};

export default createPromisor;
