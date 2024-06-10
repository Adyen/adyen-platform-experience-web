import { enumerable, getter, identity, isFunction, noop, panic, struct } from '../../../utils';
import type { Deferred, DeferredCatchCallback, DeferredThenCallback } from './types';
import type { Promised } from '../../../utils/types';

export const createDeferred = <T extends Promised<any>, K extends Promised<any> = T>(
    thenCallback?: DeferredThenCallback<T, K>,
    catchCallback?: DeferredCatchCallback<T>
) => {
    let _promise: Deferred<T, K>['promise'];
    let _reject: Deferred<T, K>['reject'];
    let _resolve: Deferred<T, K>['resolve'];

    const _catchCallback = isFunction(catchCallback) ? catchCallback : panic;
    const _thenCallback = isFunction(thenCallback) ? thenCallback : (identity as DeferredThenCallback<T, K>);

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

    const promisor = struct<Deferred<T, K>>({
        promise: getter(() => _promise),
        refresh: enumerable(_refresh),
        reject: enumerable((reason => _reject(reason)) as Deferred<T, K>['reject']),
        resolve: enumerable((value => _resolve(value)) as Deferred<T, K>['resolve']),
    });

    return _refresh();
};

export default createDeferred;
