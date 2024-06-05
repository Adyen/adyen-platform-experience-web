import { enumerable, struct } from '../../../utils';
import type { AbortSink } from './types';

const ABORT_EVENT = 'abort';
export const isAbortSignal = (value?: any): value is AbortSignal => value instanceof AbortSignal;

export const createAbortSink = (...sourceSignals: (AbortSignal | undefined)[]) => {
    let _sourceSignals = new Set<AbortSignal>();
    let _abortController = new AbortController();
    const { signal } = _abortController;

    let abort = () => {
        _abortController.abort();
        disconnect?.();
    };

    let _cleanupSignals = () => {
        _sourceSignals.forEach(signal => signal.removeEventListener(ABORT_EVENT, abort));
        _sourceSignals.clear();
        _sourceSignals = undefined!;
    };

    let disconnect = () => {
        _cleanupSignals();
        _cleanupSignals = unlink = undefined!;
        if (signal.aborted) abort = _abortController = disconnect = undefined!;
    };

    let unlink = (...sourceSignals: (AbortSignal | undefined)[]) => {
        for (const maybeSignal of sourceSignals) {
            if (isAbortSignal(maybeSignal) && _sourceSignals.delete(maybeSignal)) {
                maybeSignal.removeEventListener(ABORT_EVENT, abort);
            }
        }
        if (_sourceSignals.size === 0) disconnect?.();
    };

    for (const maybeSignal of sourceSignals) {
        if (isAbortSignal(maybeSignal)) _sourceSignals.add(maybeSignal);
    }

    _sourceSignals.forEach(signal => signal.addEventListener(ABORT_EVENT, abort));

    return struct<AbortSink>({
        abort: enumerable(abort),
        disconnect: enumerable(disconnect),
        signal: enumerable(signal),
        unlink: enumerable(unlink),
    });
};

export default createAbortSink;
