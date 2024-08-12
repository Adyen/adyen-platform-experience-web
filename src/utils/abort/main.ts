import { clamp } from '../value/number';
import { isUndefined } from '../value/is';
import { ABORT_EVENT, MAX_ABORT_TIMEOUT } from './constants';
import { abortError, augmentSignalReason, timeoutError } from './internals';

declare var AbortSignal: {
    any: (signals: AbortSignal[]) => AbortSignal;
} & typeof window.AbortSignal;

export const abortedSignal = (reason: unknown = abortError()) => {
    if ('abort' in AbortSignal) {
        return AbortSignal.abort(reason);
    }

    const _controller = new AbortController();
    const _reason = isUndefined(reason) ? abortError() : reason;
    const { signal } = _controller;

    _controller.abort(_reason);
    augmentSignalReason(signal, _reason);
    return signal;
};

export const abortSignalForAny = (signals: AbortSignal[]) => {
    if ('any' in AbortSignal) {
        return AbortSignal.any(signals);
    }

    let _sourceSignals = new Set<AbortSignal>();
    let _controller = new AbortController();
    const { signal } = _controller;

    let abort = function (this: AbortSignal) {
        _sourceSignals.forEach(signal => signal.removeEventListener(ABORT_EVENT, abort));
        _sourceSignals.clear();

        const reason = this?.reason ?? abortError();

        _controller.abort(reason);
        augmentSignalReason(signal, reason);
        _controller = _sourceSignals = abort = undefined!;
    };

    setup: {
        const NIL_EXCEPTION = Symbol('<NIL_EXCEPTION>');
        let _exception: any = NIL_EXCEPTION;

        filter: {
            try {
                for (const maybeSignal of signals) {
                    if (!isAbortSignal(maybeSignal)) throw new TypeError(`Failed to convert value to 'AbortSignal'`);
                    if (maybeSignal.aborted) break filter;
                    _sourceSignals.add(maybeSignal);
                }
            } catch (ex) {
                _exception = ex;
                break filter;
            }

            _sourceSignals.forEach(signal => signal.addEventListener(ABORT_EVENT, abort));

            // Mark setup as complete
            break setup;
        }

        // If control flow reaches here, it means either of the following:
        //  (1) at least one of the source signals is already aborted
        //  (2) at least one invalid value was passed as source signal

        // Hence, the need to abort the `signal` and destroy everything
        abort.call(signal);

        // And also throw the appropriate exception (if applicable)
        if (_exception !== NIL_EXCEPTION) throw _exception;
    }

    return signal;
};

export const abortSignalWithTimeout = (ms: number) => {
    const _timeout = clamp(0, ms, MAX_ABORT_TIMEOUT);

    if ('timeout' in AbortSignal) {
        return AbortSignal.timeout(_timeout);
    }

    let _controller = new AbortController();
    const { signal } = _controller;

    setTimeout(
        () =>
            requestAnimationFrame(() => {
                const reason = timeoutError();
                _controller.abort(reason);
                _controller = undefined!;
                augmentSignalReason(signal, reason);
            }),
        _timeout
    );

    return signal;
};

export const isAbortSignal = (value?: any): value is AbortSignal => value instanceof AbortSignal;
