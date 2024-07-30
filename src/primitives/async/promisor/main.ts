import { createAbortable } from '../abortable';
import { createDeferred } from '../deferred';
import { enumerable, getter, isUndefined, tryResolve } from '../../../utils';
import type { Promised } from '../../../utils/types';
import type { Promisor } from './types';

export const createPromisor = <T extends any, Params extends any[] = []>(
    factory: (this: any, signal: AbortSignal, ...args: Params) => Promised<T>
) => {
    const _abortable = createAbortable();
    const _deferred = createDeferred<T>();
    let _promise: Promisor<T, Params>['promise'] | undefined;

    const promisor = function (this: any, ...args) {
        isUndefined(_promise) ? _deferred.refresh() : _abortable.abort();

        const currentPromise = tryResolve.call(this, factory, _abortable.refresh().signal, ...args) as Promise<T>;

        (async () => {
            let isLatestPromise = _promise === (_promise = currentPromise);
            try {
                const value = await currentPromise.finally(() => {
                    isLatestPromise = _promise === currentPromise;
                    isLatestPromise && (_promise = undefined);
                });
                isLatestPromise && _deferred.resolve(value);
            } catch (ex) {
                isLatestPromise && _deferred.reject(ex);
            }
        })();

        return currentPromise;
    } as Promisor<T, Params>;

    return Object.defineProperties(promisor, {
        abort: enumerable(_abortable.abort),
        promise: getter(() => _deferred.promise),
        refresh: enumerable(() => void _deferred.refresh()),
    });
};

export default createPromisor;
