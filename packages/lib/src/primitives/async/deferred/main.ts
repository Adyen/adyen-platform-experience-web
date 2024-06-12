import { enumerable, getter, noop, struct } from '../../../utils';
import type { Promised } from '../../../utils/types';
import type { Deferred } from './types';

export const createDeferred = <T extends Promised<any> = any>() => {
    let _promise: Deferred<T>['promise'];
    let _reject: Deferred<T>['reject'];
    let _resolve: Deferred<T>['resolve'];

    const _refresh = () => {
        const previousResolve = _resolve ?? noop;

        const currentPromise = new Promise<T>((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });

        previousResolve((_promise = currentPromise));
        return deferred;
    };

    const deferred = struct<Deferred<T>>({
        promise: getter(() => _promise),
        refresh: enumerable(_refresh),
        reject: enumerable(reason => _reject(reason)),
        resolve: enumerable(value => _resolve(value)),
    });

    return _refresh();
};

export default createDeferred;
