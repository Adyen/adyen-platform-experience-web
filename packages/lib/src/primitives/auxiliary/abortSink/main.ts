import { enumerable, noop, struct } from '../../../utils';
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
        _cleanupSignals?.();
        _cleanupSignals = unlink = undefined!;
        if (signal.aborted) abort = _abortController = disconnect = undefined!;
    };

    let unlink = (...sourceSignals: (AbortSignal | undefined)[]) => {
        for (const maybeSignal of sourceSignals) {
            if (isAbortSignal(maybeSignal) && _sourceSignals.delete(maybeSignal)) {
                maybeSignal.removeEventListener(ABORT_EVENT, abort);
            }
        }
        if (_sourceSignals.size === 0) disconnect();
    };

    setup: {
        filter: {
            for (const maybeSignal of sourceSignals) {
                if (!isAbortSignal(maybeSignal)) continue;
                if (maybeSignal.aborted) break filter;
                _sourceSignals.add(maybeSignal);
            }

            // If control flow reaches here, it means none of the source signals is already aborted
            if (_sourceSignals.size > 0) {
                _sourceSignals.forEach(signal => signal.addEventListener(ABORT_EVENT, abort));
            } else disconnect();

            // Mark setup as complete
            break setup;
        }

        // If control flow reaches here, it means at least one of the source signals is already aborted
        // Hence, the need to abort the sink `signal` and destroy everything
        abort();
    }

    return struct<AbortSink>({
        abort: enumerable(abort ? () => abort?.() : noop),
        disconnect: enumerable(disconnect ? () => disconnect?.() : noop),
        signal: enumerable(signal),
        unlink: enumerable(unlink ? (...args) => unlink?.(...args) : noop),
    });
};

export default createAbortSink;
