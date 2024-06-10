import { createAbortable } from '../abortable';
import { createDeferred } from '../deferred';
import { enumerable, getter, tryResolve } from '../../../utils';
import type { Promisor, PromisorFactory } from './types';

export const createPromisor: PromisorFactory = factory => {
    let _promise: Promisor<typeof factory>['promise'];
    const _abortable = createAbortable(Symbol());
    const _deferred = createDeferred<typeof _promise>();

    const promisor = ((...args) => {
        _abortable.abort();
        _abortable.refresh();

        const currentPromise = (_promise = tryResolve(factory, _abortable.signal, ...args));

        (async () => {
            let resolve: () => void;

            try {
                const value = await currentPromise;
                resolve = () => _deferred.resolve(value);
            } catch (ex) {
                resolve = () => _deferred.reject(ex);
            }

            if (_promise === currentPromise) {
                _promise = undefined!;
                _deferred.refresh();
                resolve();
            }
        })();

        return currentPromise;
    }) as Promisor<typeof factory>;

    return Object.defineProperties(promisor, {
        abort: enumerable(() => _abortable.abort()),
        promise: getter(() => _deferred.promise),
    });
};

export default createPromisor;
