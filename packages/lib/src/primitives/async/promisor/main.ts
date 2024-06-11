import { createAbortable } from '../abortable';
import { createDeferred } from '../deferred';
import { enumerable, getter, isUndefined, tryResolve } from '../../../utils';
import type { Promised } from '../../../utils/types';
import type { Promisor } from './types';

export const createPromisor = <T extends any, Params extends any[] = []>(
    factory: (this: any, signal: AbortSignal, ...args: Params) => Promised<T>
) => {
    let _promise: Promisor<T, Params>['promise'];
    const _abortable = createAbortable(Symbol());
    const _deferred = createDeferred<T>();

    const promisor = function (this: any, ...args) {
        if (isUndefined(_promise)) _deferred.refresh();

        _abortable.abort();
        _abortable.refresh();

        let currentPromise: typeof _promise;
        let resolveDeferred: () => void;

        (async () => {
            try {
                _promise = tryResolve.call(this, factory, _abortable.signal, ...args) as Promise<T>;
                const value = await (currentPromise = _promise);
                resolveDeferred = () => _deferred.resolve(value);
            } catch (ex) {
                resolveDeferred = () => _deferred.reject(ex);
            }

            if (_promise === currentPromise!) {
                _promise = undefined!;
                resolveDeferred();
            }
        })();

        return currentPromise!;
    } as Promisor<T, Params>;

    return Object.defineProperties(promisor, {
        abort: enumerable(() => _abortable.abort()),
        promise: getter(() => _deferred.promise),
        refresh: enumerable(() => void _deferred.refresh()),
    });
};

export default createPromisor;
