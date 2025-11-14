import { boolOrFalse, enumerable, getter, isUndefined, noop, struct } from '../../../utils';
import type { Abortable } from './types';

export const createAbortable = <T>(abortReason?: T) => {
    let _abortController: AbortController | undefined;
    let _abortSignal: AbortSignal;
    let _abortPromise: Promise<never>;

    const _abort = () => {
        if (isUndefined(_abortController)) return;

        // Capture a reference of the signal abort procedure to be triggered
        const _abort: typeof noop = _abortController.abort.bind(_abortController);

        // Since abortable can only be refreshed if `_abortController` is `undefined`, trigger the
        // signal abort procedure after setting `_abortController` to `undefined`. This ensures that
        // `_abortController` is already `undefined` before any signal abort listener gets a chance
        // to run. Think about a signal abort listener that triggers an abortable refresh when it
        // runs — that refresh can only happen if `_abortController` is already set to `undefined`.
        _abortController = undefined;
        _abort();
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

    const _refresh = (abort = false) => {
        if (boolOrFalse(abort)) _abort();
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
        refresh: enumerable(_refresh),
        signal: getter(() => _abortSignal),
    });

    return _refresh();
};

export default createAbortable;
