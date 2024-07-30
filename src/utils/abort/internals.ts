import { enumerable, getter, hasOwnProperty } from '../struct/property';
import { DEFAULT_ABORT_ERROR_MESSAGE, DEFAULT_TIMEOUT_ERROR_MESSAGE } from './constants';
import { sameValue } from '../value/compare';

if (!hasOwnProperty(AbortSignal.prototype, 'reason')) {
    try {
        // Polyfill `AbortSignal.prototype.reason`
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
    // Polyfill `AbortSignal.prototype.throwIfAborted`
    AbortSignal.prototype.throwIfAborted = function _throwIfAborted(this: AbortSignal) {
        if (this.aborted) throw this.reason ?? abortError();
    };
}

export const abortError = (message = DEFAULT_ABORT_ERROR_MESSAGE) => new DOMException(message, 'AbortError');
export const timeoutError = (message = DEFAULT_TIMEOUT_ERROR_MESSAGE) => new DOMException(message, 'TimeoutError');

export const augmentSignalReason = (signal: AbortSignal, reason: any) => {
    if (!sameValue(signal.reason, reason)) {
        try {
            Object.defineProperty(signal, 'reason', enumerable(reason));
        } catch {
            // `signal` is non-extensible or `reason` property already exists
            // do nothing (fail silently)
        }
    }
    return signal;
};
