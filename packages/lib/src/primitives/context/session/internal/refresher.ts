import {
    ERR_SESSION_FACTORY_UNAVAILABLE,
    ERR_SESSION_INVALID,
    ERR_SESSION_REFRESH_ABORTED,
    EVT_SESSION_EXPIRED,
    EVT_SESSION_REFRESHING_END,
    EVT_SESSION_REFRESHING_START,
} from '../constants';
import { INTERNAL_EVT_SESSION_READY } from './constants';
import { createPromisor } from '../../../async/promisor';
import { createEventEmitter, Emitter } from '../../../reactive/eventEmitter';
import { ALREADY_RESOLVED_PROMISE, enumerable, getter, isFunction, struct, tryResolve } from '../../../../utils';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionEventEmitter, SessionRefresher } from './types';

const _sessionPlaceholder = Symbol('<next_session>');

export const createSessionRefresher = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _refreshPending = false;
    let _refreshingPromise: Promise<void> | undefined;
    let _refreshingSignal: AbortSignal | undefined;
    let _waitForRefreshingPromise = true;
    let _session: T | undefined;

    const _sessionEmitter: SessionEventEmitter = createEventEmitter();

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

    const _expire: SessionRefresher<T>['expire'] = expireCallback => {
        if (_refreshPending) return;
        try {
            _refreshPending = true;
            void expireCallback?.();
        } finally {
            emitter.emit(EVT_SESSION_EXPIRED);
        }
    };

    const _refreshPromisor = createPromisor(async (signal: AbortSignal) => {
        let _nextSession: any = _sessionPlaceholder;
        try {
            _refreshPending = false;
            _refreshingSignal = signal;

            if (_waitForRefreshingPromise) {
                await (_refreshingPromise ??= (async () => {
                    /////////////////////////////////////////////////////////////////
                    // Should run only once for each batch of refresh attempts, at //
                    // the start (the first refresh attempt) of the current batch. //
                    /////////////////////////////////////////////////////////////////

                    // Defer dispatching `EVT_SESSION_REFRESHING_START` event
                    // until the next tick, thus guaranteeing consistent async behavior
                    // for every `refreshPromisor()` call.
                    await ALREADY_RESOLVED_PROMISE;

                    // Subsequent refresh attempts need not await `_refreshingPromise` anymore
                    _waitForRefreshingPromise = false;

                    emitter.emit(EVT_SESSION_REFRESHING_START);
                })());
            }

            _assertSessionFactory(specification.onRefresh);

            _nextSession = await tryResolve(() => specification.onRefresh(_session, signal)).finally(() => {
                if (signal.aborted) throw ERR_SESSION_REFRESH_ABORTED;
            });
        } finally {
            if (_refreshingSignal === signal) {
                //////////////////////////////////////////////////////////////////
                // These session refresh completion steps should run only once, //
                // at the end of each batch of session refresh attempts (only   //
                // for the last session refresh request).                       //
                //////////////////////////////////////////////////////////////////

                try {
                    if (_nextSession !== _sessionPlaceholder) {
                        _assertSession(_nextSession);
                        _session = _nextSession;
                        _sessionEmitter.emit(INTERNAL_EVT_SESSION_READY);
                    }
                } finally {
                    // Mark current batch of refresh attempts as completed
                    _refreshingPromise = undefined;
                    _waitForRefreshingPromise = true;
                    emitter.emit(EVT_SESSION_REFRESHING_END);
                }
            }
        }
    });

    return struct<SessionRefresher<T>>({
        expire: enumerable(_expire),
        on: enumerable(_sessionEmitter.on),
        pending: getter(() => _refreshPending && !_refreshingPromise),
        promise: getter(() => _refreshPromisor.promise),
        refresh: enumerable(() => _refreshPromisor()),
        refreshing: getter(() => !!_refreshingPromise),
        session: getter(() => _session),
        signal: getter(() => _refreshingSignal),
    });
};

export default createSessionRefresher;
