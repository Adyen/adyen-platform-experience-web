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
        _promise = tryResolve.call(this, factory, _abortable.signal, ...args) as Promise<T>;

        let resolveDeferred: () => void;
        const currentPromise = _promise;

        (async () => {
            try {
                const value = await currentPromise;
                resolveDeferred = () => _deferred.resolve(value);
            } catch (ex) {
                resolveDeferred = () => _deferred.reject(ex);
            }

            if (_promise === currentPromise) {
                _promise = undefined!;
                resolveDeferred();
            }
        })();

        return currentPromise;
    } as Promisor<T, Params>;

    return Object.defineProperties(promisor, {
        abort: enumerable(() => _abortable.abort()),
        promise: getter(() => _deferred.promise),
        refresh: enumerable(() => void _deferred.refresh()),
    });
};

export default createPromisor;
