import { ERR_SESSION_EXPIRED } from '../constants';
import { createPromisor } from '../../../async/promisor';
import { boolOrFalse, enumerable, falsify, isFunction, noop, struct, tryResolve } from '../../../../utils';
import type { Emitter } from '../../../reactive/eventEmitter';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionAutofresher, SessionRefresher } from './types';

export const createSessionAutofresher = <T extends any>(
    emitter: Emitter<SessionEventType>,
    specification: SessionSpecification<T>,
    refresher: SessionRefresher<T>
) => {
    const _canAutofresh = async () => {
        const canAutofresh = await tryResolve(async () => {
            const _autoRefresh = specification.autoRefresh;
            return isFunction(_autoRefresh) ? _autoRefresh.call(specification, refresher.session) : _autoRefresh;
        }).catch(falsify);

        return boolOrFalse(canAutofresh);
    };

    const _refresh = async (skipCanAutofreshCheck = false) => {
        const canAutofresh = boolOrFalse(skipCanAutofreshCheck) || (await _canAutofresh());
        if (canAutofresh && refresher.pending) {
            // a no-op catch callback is used here (`noop`),
            // to silence unnecessary unhandled promise rejection warnings
            refresher.refresh().catch(noop);
        }
    };

    const _recover = (error: any) => {
        if (error !== ERR_SESSION_EXPIRED) throw error;
        refresher.expire(_refresh);
    };

    return struct<SessionAutofresher>({
        recover: enumerable(_recover),
        refresh: enumerable(skipCanAutofreshCheck => void _refresh(skipCanAutofreshCheck)),
    });
};

export default createSessionAutofresher;
