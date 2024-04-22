import { enumerable, getter, struct } from '@src/utils/common';
import type { Abortable } from './types';

export const createAbortable = <T>(abortReason?: T) => {
    let _abortController = new AbortController();
    let _abortPromise: Promise<never> | undefined;

    const _getAbortPromise = () => {
        _abortPromise ??= new Promise<never>((_, reject) => {
            _abortController.signal.addEventListener('abort', function _abort() {
                _abortController.signal.removeEventListener('abort', _abort);
                reject(abortReason);
            });

            if (_abortController.signal.aborted) throw abortReason;
        });

        _abortPromise.catch(() => {
            _abortController = new AbortController();
            _abortPromise = undefined;
        });

        return _abortPromise;
    };

    return struct({
        abort: enumerable(() => _abortController.abort()),
        promise: getter(_getAbortPromise),
        reason: enumerable(abortReason),
        signal: getter(() => _abortController.signal),
    }) as Abortable<T>;
};

export default createAbortable;
