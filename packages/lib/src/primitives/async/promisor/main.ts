import { createAbortable } from '../abortable';
import { createDeferred } from '../deferred';
import { enumerable, getter, isUndefined, tryResolve } from '../../../utils';
import type { Promised } from '../../../utils/types';
import type { Promisor } from './types';

export const createPromisor = <T extends any, Params extends any[] = []>(
    factory: (this: any, signal: AbortSignal, ...args: Params) => Promised<T>
) => {
    let _promise: Promisor<T, Params>['promise'];
    let _signal: AbortSignal | undefined;
    const _abortable = createAbortable(Symbol());
    const _deferred = createDeferred<T>();

    const _getSignal = () => {
        if (_signal && _signal.aborted) return _signal;
        _abortable.refresh();
        return _abortable.signal;
    };

    const _setSignal = (signal: AbortSignal | null | undefined) => {
        if (_signal === signal) return;

        // _signal?.removeEventListener('abort', promisor.abort);
        _signal = signal instanceof AbortSignal ? signal : undefined;
        // _signal?.aborted ? promisor.abort() : _signal?.addEventListener('abort', promisor.abort);
    };

    const promisor = function (this: any, ...args) {
        isUndefined(_promise) ? _deferred.refresh() : _abortable.abort();

        const currentPromise = (_promise = tryResolve.call(this, factory, _getSignal(), ...args) as Promise<T>);
        let _isLatest = false;

        (async () => {
            try {
                const value = await currentPromise.finally(() => (_isLatest = _promise === currentPromise) && (_promise = undefined!));
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
        signal: { ...getter(() => _signal, false), set: _setSignal },
    });
};

export default createPromisor;
