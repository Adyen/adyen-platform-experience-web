import { boolOrFalse, falsify, getter, isFunction, noop, tryResolve } from '../../../../utils';
import { createPromisor } from '../../../async/promisor';
import { EVT_SESSION_EXPIRED } from '../constants';
import type { SessionRefresher } from './types';

export const _canAutofresh = async <T extends any>(refresher: SessionRefresher<T>) => {
    const { specification } = refresher.context;

    const canAutofresh = await tryResolve(async () => {
        const _autoRefresh = specification.autoRefresh;
        return isFunction(_autoRefresh) ? _autoRefresh.call(specification, refresher.session) : _autoRefresh;
    }).catch(falsify);

    return boolOrFalse(canAutofresh);
};

export const createSessionAutofresher = <T extends any>(refresher: SessionRefresher<T>) => {
    let _unlistenExpired = refresher.context.emitter.on(EVT_SESSION_EXPIRED, () => _autofresh(false));
    let _autofreshSignal: AbortSignal | undefined;

    let _autofreshPromisor = createPromisor(async (signal, skipCanAutofreshCheck = false) => {
        _autofreshSignal = signal;

        const canAutofresh = boolOrFalse(skipCanAutofreshCheck) || (await _canAutofresh(refresher));

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

    let _autofresh = (skipCanAutofreshCheck = false) => {
        if (!refresher.refreshing) void _autofreshPromisor(skipCanAutofreshCheck);
    };

    let _destruct = () => {
        _unlistenExpired();
        _autofreshPromisor.abort();
        _autofreshPromisor = _autofreshSignal = _unlistenExpired = undefined!;
        _autofresh = _destruct = noop;
    };

    const autofresh = (skipCanAutofreshCheck = false) => _autofresh(skipCanAutofreshCheck);

    return Object.defineProperties(autofresh as typeof autofresh & { readonly destruct: () => void }, {
        destruct: getter(() => _destruct, false),
    });
};

export default createSessionAutofresher;
