import {
    ERR_SESSION_EXPIRED,
    ERR_SESSION_FACTORY_UNAVAILABLE,
    ERR_SESSION_INVALID,
    ERR_SESSION_REFRESH_ABORTED,
    EVT_SESSION_EXPIRED,
    EVT_SESSION_REFRESHED,
    EVT_SESSION_REFRESHING_END,
    EVT_SESSION_REFRESHING_START,
} from '../constants';
import { INTERNAL_EVT_SESSION_READY } from './constants';
import { createPromisor } from '../../../async/promisor';
import { createEventEmitter, Emitter } from '../../../reactive/eventEmitter';
import { ALREADY_RESOLVED_PROMISE, boolOrFalse, enumerable, falsify, getter, isFunction, struct, tryResolve } from '../../../../utils';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionEventEmitter, SessionRefreshController } from './types';

export const createSessionRefreshController = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _readyPromise: Promise<void> | undefined;
    let _refreshingPromise: Promise<void> | undefined;
    let _refreshingSignal: AbortSignal | undefined;
    let _refreshPending = false;
    let _session: T | undefined;

    const _sessionEmitter: SessionEventEmitter<T> = createEventEmitter();

    function _assertSession(value: any): asserts value is T {
        try {
            specification.assert?.(value);
        } catch (ex) {
            throw ERR_SESSION_INVALID;
        }
    }

    function _assertSessionFactory(value: any): asserts value is NonNullable<SessionSpecification<T>['onRefresh']> {
        if (!isFunction(value)) throw ERR_SESSION_FACTORY_UNAVAILABLE;
    }

    const _canAutoRefresh = async () => {
        const canAutoRefresh = await tryResolve(async () => {
            const _autoRefresh = specification.autoRefresh;
            return isFunction(_autoRefresh) ? _autoRefresh.call(specification, _session) : _autoRefresh;
        }).catch(falsify);

        return boolOrFalse(canAutoRefresh);
    };

    const _autoRefresh = async (skipAutoRefreshCheck = false) => {
        if (!boolOrFalse(skipAutoRefreshCheck) && !(await _canAutoRefresh())) return;
        if (!_refreshPending || refreshController.refreshing) return;
        void refreshController.refresh();
    };

    const _errorRefresh = (error: any) => {
        if (error !== ERR_SESSION_EXPIRED) throw error;
        if (_refreshPending) return;
        void _autoRefresh();
        emitter.emit(EVT_SESSION_EXPIRED);
    };

    const _getReadyPromise = () =>
        (_readyPromise ??= new Promise(resolve => {
            const _refreshingCompleted = () => {
                _offSessionExpired();
                _offSessionRefreshed();
                _offSessionExpired = _offSessionRefreshed = undefined!;
                resolve();
            };

            let _offSessionExpired = emitter.on(EVT_SESSION_EXPIRED, _refreshingCompleted);
            let _offSessionRefreshed = emitter.on(EVT_SESSION_REFRESHED, _refreshingCompleted);

            _sessionEmitter.emit(INTERNAL_EVT_SESSION_READY, _session!);
        }));

    const _refreshPromisor = createPromisor(async (signal: AbortSignal) => {
        try {
            _refreshingSignal = signal;

            await (_refreshingPromise ??= (async () => {
                // Defer dispatching `EVT_SESSION_REFRESHING_START` event to the next tick
                // For a more consistent async behavior on calling `refreshPromisor()`
                await (_readyPromise ??= ALREADY_RESOLVED_PROMISE);
                emitter.emit(EVT_SESSION_REFRESHING_START);
            })());

            _assertSessionFactory(specification.onRefresh);

            const session = await tryResolve(() => specification.onRefresh(_session, signal)).finally(() => {
                if (signal.aborted) throw ERR_SESSION_REFRESH_ABORTED;
            });

            _assertSession(session);
            _readyPromise = undefined;
            _session = session;

            return _session;
        } finally {
            // The session refresh completion steps should run only once
            // Only for the last session refresh request
            if (_refreshingSignal === signal) {
                _getReadyPromise().finally(() => {
                    // Wait for ready signal before marking refresh as completed
                    _readyPromise = _refreshingPromise = undefined;
                    emitter.emit(EVT_SESSION_REFRESHING_END);
                });
            }
        }
    });

    const refreshController = struct<SessionRefreshController<T>>({
        autoRefresh: enumerable(_autoRefresh),
        errorRefresh: enumerable(_errorRefresh),
        on: enumerable(_sessionEmitter.on),
        promise: getter(() => _refreshPromisor.promise),
        refresh: enumerable(() => _refreshPromisor()),
        refreshing: getter(() => !!_refreshingPromise),
        session: getter(() => _session),
        signal: getter(() => _refreshingSignal),
    });

    emitter.on(EVT_SESSION_EXPIRED, () => (_refreshPending = true));
    emitter.on(EVT_SESSION_REFRESHING_END, () => (_refreshPending = false));

    return refreshController;
};

export default createSessionRefreshController;
