import { createAbortable } from '../abortable';
import { createDeferred } from '../deferred';
import { enumerable, getter, tryResolve } from '../../../utils';
import type { Promisor, PromisorFactory } from './types';

export const createPromisor: PromisorFactory = factory => {
    let _promise: Promisor<typeof factory>['promise'];
    const _abortable = createAbortable(Symbol());
    const _deferred = createDeferred<typeof _promise>();

    const promisor = function (this: any, ...args) {
        _abortable.abort();
        _abortable.refresh();

        let _currentPromise: typeof _promise;
        let _resolveDeferredPromise: () => void;

        (async () => {
            try {
                _currentPromise = _promise = tryResolve.apply(this, [factory, _abortable.signal, ...args]);
                const value = await _currentPromise;
                _resolveDeferredPromise = () => _deferred.resolve(value);
            } catch (ex) {
                _resolveDeferredPromise = () => _deferred.reject(ex);
            }

            if (_promise === _currentPromise!) {
                _promise = undefined!;
                _resolveDeferredPromise?.();
                _deferred.refresh();
            }
        })();

        return _currentPromise!;
    } as Promisor<typeof factory>;

    return Object.defineProperties(promisor, {
        abort: enumerable(() => _abortable.abort()),
        promise: getter(() => _deferred.promise),
    });
};

export default createPromisor;
