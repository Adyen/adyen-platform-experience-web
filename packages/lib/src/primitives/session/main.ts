import clock from '../timing/clock';
import { createAbortable } from '../async/abortable';
import { createPromisor } from '../async/promisor';
import { createEventEmitter } from '../reactive/eventEmitter';
import { UNSUBSCRIBE_TOKEN } from '../reactive/watchlist';
import { ALREADY_RESOLVED_PROMISE, asPlainObject, enumerable, getter, isFunction, noop, parseTimestamp } from '../utils';
import type { Session, SessionCallable, SessionEventType, SessionFactory, SessionHttpExecutor, SessionProvisioningParams } from './types';
import {
    ERR_SESSION_EXPIRED,
    ERR_SESSION_FACTORY_UNAVAILABLE,
    ERR_SESSION_HTTP_UNAVAILABLE,
    ERR_SESSION_INIT_ABORTED,
    ERR_SESSION_INVALID,
    EVT_SESSION_ACTIVE_STATE_CHANGE,
    EVT_SESSION_INIT_STATE_CHANGE,
} from './constants';

const _SECRET_VALUE: unique symbol = Symbol('<<SECRET>>');

export const createSessionHandle = <T, HttpParams extends any[] = any[]>(
    withSessionProvisioningParams?: SessionProvisioningParams<T, HttpParams>
) => {
    let {
        assert: _assertNextSession,
        createNext: _createNextSession,
        getDeadline: _getSessionDeadline,
        http: _performSessionHttp,
    } = asPlainObject<NonNullable<typeof withSessionProvisioningParams>>();

    let _cachedNextSession: T | typeof _SECRET_VALUE = _SECRET_VALUE;
    let _cachedSessionExpiresTimestamp: typeof _sessionExpiresTimestamp | typeof _SECRET_VALUE = _SECRET_VALUE;
    let _completedNextSessionAssertion = false;
    let _createNextSessionPromise: Promise<T> | undefined;

    let _currentAssertNextSession: typeof _assertNextSession;
    let _currentCreateNextSession: typeof _createNextSession;
    let _currentGetSessionDeadline: typeof _getSessionDeadline;

    let _session: T | undefined;
    let _sessionExpired = false;
    let _sessionExpiredNotificationPending = false;
    let _sessionExpiresTimestamp: DOMHighResTimeStamp | undefined;
    let _sessionInitEventPending = false;
    let _sessionInitializing = false;
    let _sessionTimestamp: Session<T, HttpParams>['timestamp'];
    let _terminateSessionClock: (() => void) | undefined;

    const _sessionEventEmitter = createEventEmitter<SessionEventType>();
    const _sessionInitAbortable = createAbortable(ERR_SESSION_INIT_ABORTED);

    const _sessionPromisor = createPromisor<T>(session => {
        _sessionExpired = _sessionExpiredNotificationPending = false;
        _sessionEventEmitter.emit(EVT_SESSION_ACTIVE_STATE_CHANGE);
        return session;
    });

    function _assertSession(value: any): asserts value is T {
        try {
            _assertNextSession?.(value);
        } catch (ex) {
            throw ERR_SESSION_INVALID;
        }
    }

    function _assertSessionFactory(value: any): asserts value is SessionFactory<T, HttpParams> {
        if (isFunction<SessionFactory<T>>(value)) return;
        throw ERR_SESSION_FACTORY_UNAVAILABLE;
    }

    function _assertSessionHttp(value: any): asserts value is SessionHttpExecutor<T, HttpParams> {
        if (isFunction<SessionHttpExecutor<T, HttpParams>>(value)) return;
        throw ERR_SESSION_HTTP_UNAVAILABLE;
    }

    const _createNextSessionInvalidationCheck = () => {
        let currentStage = 0;
        let invalidated = false;

        loop: while (currentStage++) {
            switch (currentStage) {
                case 0:
                    if ((invalidated ||= _currentCreateNextSession !== _createNextSession)) {
                        _currentCreateNextSession = _createNextSession;
                        _cachedNextSession = _SECRET_VALUE;
                    }
                    break;
                case 1:
                    if ((invalidated ||= _currentAssertNextSession !== _assertNextSession)) {
                        _currentAssertNextSession = _assertNextSession;
                        _completedNextSessionAssertion = false;
                    }
                    break;
                case 2:
                    if ((invalidated ||= _currentGetSessionDeadline !== _getSessionDeadline)) {
                        _currentGetSessionDeadline = _getSessionDeadline;
                        _cachedSessionExpiresTimestamp = _SECRET_VALUE;
                    }
                    break;
                default:
                    break loop;
            }
        }

        if (invalidated) throw _sessionInitAbortable.reason;
    };

    const _executeCreateNextSession = () => {
        if (_currentCreateNextSession !== _createNextSession) {
            _sessionInitAbortable.abort();
            _sessionInitAbortable.refresh();
        }

        _createNextSessionPromise ??= (async (): Promise<T> => {
            while (true) {
                const abortReason = _sessionInitAbortable.reason;
                const signal = _sessionInitAbortable.signal;

                const createNextSession = (async () => {
                    if (_cachedNextSession === _SECRET_VALUE) {
                        _assertSessionFactory(_createNextSession);
                        _cachedNextSession = await _createNextSession(_session, signal);
                    }

                    _createNextSessionInvalidationCheck();

                    if (!_completedNextSessionAssertion) {
                        _assertSession(_cachedNextSession);
                        _completedNextSessionAssertion = true;
                    }

                    try {
                        if (_cachedSessionExpiresTimestamp === _SECRET_VALUE) {
                            _sessionTimestamp = Date.now();
                            _sessionExpiresTimestamp = undefined;
                            _sessionExpiresTimestamp = parseTimestamp(await _getSessionDeadline?.(_cachedNextSession));
                            _cachedSessionExpiresTimestamp = _sessionExpiresTimestamp;
                        }
                    } catch {
                        /* ignore _getSessionDeadline() errors */
                    }

                    _createNextSessionInvalidationCheck();
                    _initializeSessionClock();

                    return _cachedNextSession;
                })();

                let sessionOrErr: T | typeof abortReason | undefined;

                await Promise.race([createNextSession, _sessionInitAbortable.promise])
                    .then(nextSession => (sessionOrErr = nextSession))
                    .catch(reason => {
                        if (reason === abortReason || signal.aborted) {
                            sessionOrErr = abortReason;
                        } else {
                            _resetSessionInitialization();
                            throw reason;
                        }
                    });

                if (!(sessionOrErr === abortReason || signal.aborted)) {
                    _resetSessionInitialization();
                    return sessionOrErr as T;
                }
            }
        })();

        return _createNextSessionPromise;
    };

    const _initializeSessionClock = () => {
        if (_sessionExpiresTimestamp === undefined) return;

        _terminateSessionClock?.();

        let unsubscribeSessionClock: ReturnType<(typeof clock)['subscribe']> | undefined = clock.subscribe(snapshotOrSignal => {
            if (snapshotOrSignal === UNSUBSCRIBE_TOKEN) return _terminateSessionClock?.();
            if (snapshotOrSignal.now < _sessionExpiresTimestamp!) return;
            _onSessionExpired();
        });

        _terminateSessionClock = () => {
            unsubscribeSessionClock?.();
            unsubscribeSessionClock = _terminateSessionClock = undefined;
        };
    };

    const _onSessionExpired = () => {
        if (_sessionExpiredNotificationPending) return;

        _terminateSessionClock?.();
        _sessionExpired = _sessionExpiredNotificationPending = true;
        _sessionEventEmitter.emit(EVT_SESSION_ACTIVE_STATE_CHANGE);
        _sessionRefresh();
    };

    const _refreshSession = async () => {
        // Capture the current abort signal for this session refresh request
        const signal = _sessionInitAbortable.signal;

        if (!_sessionInitializing) {
            _sessionInitializing = true;

            // Await an already resolved promise to defer the dispatch of the `initStateChange` event
            // Should be sufficient to ensure that any pending `initStateChange` event gets dispatched first
            if (_sessionInitEventPending) await ALREADY_RESOLVED_PROMISE;

            _sessionEventEmitter.emit(EVT_SESSION_INIT_STATE_CHANGE);
        }

        try {
            _sessionPromisor.resolve((_session = await _executeCreateNextSession()));
        } finally {
            /* Finally block to ensure that control flow always reaches here. */

            // An important case is when an error (that is not an abort error) occurred during
            // the latest session refresh request, hence the session initialization completion
            // steps need to be run (should run only once).
            if (!signal.aborted && _sessionInitializing) {
                _sessionInitializing = false;
                _sessionInitEventPending = true;

                // Await an already resolved promise to defer the dispatch of the `initStateChange` event
                // Should be sufficient to ensure that the `activeStateChange` event gets dispatched first
                await ALREADY_RESOLVED_PROMISE;

                _sessionInitEventPending = false;
                _sessionEventEmitter.emit(EVT_SESSION_INIT_STATE_CHANGE);
            }
        }
    };

    const _resetSessionInitialization = () => {
        _cachedNextSession = _cachedSessionExpiresTimestamp = _SECRET_VALUE;
        _completedNextSessionAssertion = false;
        _createNextSessionPromise = undefined;
    };

    const _sessionHttp: Session<T, HttpParams>['http'] = async (...args) => {
        if ((_sessionIsExpired() as any) !== false) _sessionRefresh();

        while (true) {
            try {
                const session = await _sessionPromisor.promise;
                _assertSessionHttp(_performSessionHttp);
                return await _performSessionHttp(session, ...args);
            } catch (ex) {
                if (ex !== ERR_SESSION_EXPIRED) throw ex;
                _onSessionExpired();
            }
        }
    };

    const _sessionIsExpired = (): Session<T, HttpParams>['isExpired'] => {
        if (_sessionExpired) return _sessionExpired;
        if (_sessionExpiresTimestamp === undefined) return;
        if ((_sessionExpired = performance.now() >= _sessionExpiresTimestamp)) _onSessionExpired();
        return _sessionExpired;
    };

    const _sessionRefresh = () => {
        _sessionPromisor.refresh();
        // no-op catch callback ensures that the unnecessary unhandled rejection warnings are silenced.
        _refreshSession().catch(noop);
    };

    const _updateSessionProvisioningParams: SessionCallable<T, HttpParams> = withSessionProvisioningParams => {
        const { assert, createNext, getDeadline, http } = asPlainObject<SessionProvisioningParams<T>>(withSessionProvisioningParams);

        if (isFunction(assert)) _assertNextSession = assert;
        if (isFunction(createNext)) _createNextSession = createNext;
        if (isFunction(getDeadline)) _getSessionDeadline = getDeadline;
        if (isFunction(http)) _performSessionHttp = http;
    };

    const session: SessionCallable<T, HttpParams> = withSessionProvisioningParams => {
        _updateSessionProvisioningParams(withSessionProvisioningParams);

        _currentAssertNextSession = _assertNextSession;
        _currentCreateNextSession = _createNextSession;
        _currentGetSessionDeadline = _getSessionDeadline;

        return _refreshSession();
    };

    _updateSessionProvisioningParams(withSessionProvisioningParams);

    return Object.defineProperties(session, {
        http: enumerable(_sessionHttp),
        initializing: getter(() => _sessionInitializing),
        isExpired: getter(_sessionIsExpired),
        on: enumerable(_sessionEventEmitter.on),
        timestamp: getter(() => _sessionTimestamp),
    }) as typeof session & Session<T, HttpParams>;
};

export default createSessionHandle;
