import { createAbortable } from '../abortable';
import { createDeferred } from '../deferred';
import { enumerable, getter, isUndefined, tryResolve } from '../../../utils';
import type { Promised } from '../../../utils/types';
import type { Promisor } from './types';

export const createPromisor = <T extends any, Params extends any[] = []>(
    factory: (this: any, signal: AbortSignal, ...args: Params) => Promised<T>
) => {
    let _promise: Promisor<T, Params>['promise'] | undefined;
    const _abortable = createAbortable(Symbol());
    const _deferred = createDeferred<T>();

    const _getAbortSignal = (signal: AbortSignal | null | undefined) => {
        if (signal instanceof AbortSignal && signal.aborted) return signal;
        _abortable.refresh();
        return _abortable.signal;
    };

    const promisor = function (this: any, signal?: AbortSignal | null, ...args) {
        isUndefined(_promise) ? _deferred.refresh() : _abortable.abort();

        const currentPromise = (_promise = tryResolve.call(this, factory, _getAbortSignal(signal), ...args) as Promise<T>);
        let _isLatest = false;

        (async () => {
            try {
                const value = await currentPromise.finally(() => (_isLatest = _promise === currentPromise) && (_promise = undefined));
                _isLatest && _deferred.resolve(value);
            } catch (ex) {
                _isLatest && _deferred.reject(ex);
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
