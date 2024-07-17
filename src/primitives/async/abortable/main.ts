import { enumerable, getter, isUndefined, noop, struct } from '../../../utils';
import type { Abortable } from './types';

export const createAbortable = <T>(abortReason?: T) => {
    let _abortController: AbortController | undefined;
    let _abortSignal: AbortSignal;
    let _abortPromise: Promise<never>;

    const _abort = () => {
        _abortController?.abort();
        _abortController = undefined;
    };

    const _getAbortPromise = () => {
        _abortPromise = new Promise<never>((_, reject) => {
            _abortSignal.addEventListener('abort', function _abort() {
                _abortSignal.removeEventListener('abort', _abort);
                reject(abortReason);
            });

            if (_abortSignal.aborted) throw abortReason;
        });

        // no-op catch callback to silence unnecessary "unhandled rejection" warnings
        _abortPromise.catch(noop);

        return _abortPromise;
    };

    const _refreshIfNecessary = () => {
        if (isUndefined(_abortController)) {
            _abortController = new AbortController();
            _abortSignal = _abortController.signal;
            _abortPromise = _getAbortPromise();
        }
        return abortable;
    };

    const abortable = struct<Abortable<T>>({
        abort: enumerable(_abort),
        promise: getter(() => _abortPromise),
        reason: enumerable(abortReason),
        refresh: enumerable(_refreshIfNecessary),
        signal: getter(() => _abortSignal),
    });

    return _refreshIfNecessary();
};

export default createAbortable;
