import { boolOrFalse, falsify, isFunction, noop, tryResolve } from '../../../../utils';
import { createPromisor } from '../../../async/promisor';
import { EVT_SESSION_EXPIRED } from '../constants';
import type { SessionRefresher } from './types';

export const createSessionAutofresher = <T extends any>(refresher: SessionRefresher<T>) => {
    const { emitter, specification } = refresher.context;
    let _autofreshSignal: AbortSignal | undefined;

    const _canAutofresh = async () => {
        const canAutofresh = await tryResolve(async () => {
            const _autoRefresh = specification.autoRefresh;
            return isFunction(_autoRefresh) ? _autoRefresh.call(specification, refresher.session) : _autoRefresh;
        }).catch(falsify);

        return boolOrFalse(canAutofresh);
    };

    const _autofreshPromisor = createPromisor(async (signal, skipCanAutofreshCheck = false) => {
        _autofreshSignal = signal;

        const canAutofresh = boolOrFalse(skipCanAutofreshCheck) || (await _canAutofresh());

        if (_autofreshSignal !== signal) {
            // The current autofresh signal does not match the autofresh attempt `signal`,
            // meaning that this autofresh attempt is not the latest attempt.
            // Return immediately to silently ignore this autofresh attempt.
            return;
        }

        if (canAutofresh && refresher.pending && !refresher.refreshing) {
            // a no-op catch callback is used here (`noop`),
            // to silence unnecessary unhandled promise rejection warnings
            refresher.refresh(_autofreshSignal).catch(noop);
        }
    });

    emitter.on(EVT_SESSION_EXPIRED, () => {
        if (_autofreshSignal && !_autofreshSignal.aborted) {
            // Signal for cancellation of the latest ongoing autofresh attempt (if any),
            // because there would probably be another autofresh attempt (shortly).
            _autofreshPromisor.abort();
        }
        void _autofreshPromisor(null, false);
    });

    return (skipCanAutofreshCheck = false) => void _autofreshPromisor(null, skipCanAutofreshCheck);
};

export default createSessionAutofresher;
