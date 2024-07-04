import { enumerable, getter, hasOwnProperty } from '../struct/property';
import { DEFAULT_ABORT_ERROR_MESSAGE, DEFAULT_TIMEOUT_ERROR_MESSAGE } from './constants';

/* Begin `AbortSignal.prototype` polyfill */
if (!hasOwnProperty(AbortSignal.prototype, 'reason')) {
    try {
        Object.defineProperty(AbortSignal.prototype, 'reason', {
            ...getter(function _getReason(this: AbortSignal) {
                return this.aborted ? abortError() : void 0;
            }, true),
            configurable: true,
        });
    } catch {
        // `AbortSignal.prototype` is non-extensible or `reason` property already exists
        // do nothing (fail silently)
    }
}

if (!hasOwnProperty(AbortSignal.prototype, 'throwIfAborted')) {
    AbortSignal.prototype.throwIfAborted = function _throwIfAborted(this: AbortSignal) {
        if (this.aborted) throw this.reason ?? abortError();
    };
}
/* End `AbortSignal.prototype` polyfill */

export const augmentSignalReason = (signal: AbortSignal, reason: any) => {
    if (signal.reason !== reason) {
        try {
            Object.defineProperty(signal, 'reason', enumerable(reason));
        } catch {
            // `signal` is non-extensible or `reason` property already exists
            // do nothing (fail silently)
        }
    }
    return signal;
};

export const abortError = (message = DEFAULT_ABORT_ERROR_MESSAGE) => new DOMException(message, 'AbortError');
export const timeoutError = (message = DEFAULT_TIMEOUT_ERROR_MESSAGE) => new DOMException(message, 'TimeoutError');
