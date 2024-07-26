import { createPromisor } from '../../../async/promisor';
import { createEventEmitter, Emitter } from '../../../reactive/eventEmitter';
import { abortSignalForAny, ALREADY_RESOLVED_PROMISE, enumerable, getter, isAbortSignal, isFunction, struct, tryResolve } from '../../../../utils';
import { INTERNAL_EVT_SESSION_READY, INTERNAL_EVT_SESSION_REFRESHING_END, INTERNAL_EVT_SESSION_REFRESHING_START } from './constants';
import { ERR_SESSION_FACTORY_UNAVAILABLE, ERR_SESSION_INVALID, ERR_SESSION_REFRESH_ABORTED, EVT_SESSION_EXPIRED } from '../constants';
import type { SessionRefresher, SessionRefresherContext, SessionRefresherEmitter } from './types';
import type { SessionEventType, SessionSpecification } from '../types';

export const createSessionRefresher = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _refreshPending = false;
    let _refreshingPromise: Promise<void> | undefined;
    let _refreshingSignal: AbortSignal;
    let _waitForRefreshingPromise = true;
    let _session: T | undefined;

    const _sessionPlaceholder = Symbol('<next_session>');
    const _refresherEmitter: SessionRefresherEmitter = createEventEmitter();

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

    const _refreshPromisor = createPromisor((promisorSignal, signal?: AbortSignal | null | undefined) => {
        if (!_refreshingSignal) _refreshingSignal = promisorSignal;
        else return _refreshSession(isAbortSignal(signal) ? abortSignalForAny([signal, promisorSignal]) : promisorSignal);
    });

    const _refreshSession = async (signal: AbortSignal) => {
        let nextSession: any = _sessionPlaceholder;
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

                    _refresherEmitter.emit(INTERNAL_EVT_SESSION_REFRESHING_START);
                })());
            }

            _assertSessionFactory(specification.onRefresh);

            nextSession = await tryResolve(() => specification.onRefresh(_session, signal)).finally(() => {
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
                    if (nextSession !== _sessionPlaceholder) {
                        _assertSession(nextSession);
                        _session = nextSession;
                        _refresherEmitter.emit(INTERNAL_EVT_SESSION_READY);
                    }
                } finally {
                    // Mark current batch of refresh attempts as completed
                    _refreshingPromise = undefined;
                    _waitForRefreshingPromise = true;
                    _refresherEmitter.emit(INTERNAL_EVT_SESSION_REFRESHING_END);
                }
            }
        }
    };

    emitter.on(EVT_SESSION_EXPIRED, () => (_refreshPending = !_refreshingPromise));

    // Initial refresh promisor call to capture the refreshing signal
    void _refreshPromisor();

    return struct<SessionRefresher<T>>({
        context: enumerable(
            struct<SessionRefresherContext<T>>({
                emitter: enumerable(emitter),
                specification: enumerable(specification),
            })
        ),
        on: enumerable(_refresherEmitter.on),
        pending: getter(() => _refreshPending),
        promise: getter(() => _refreshPromisor.promise),
        refresh: enumerable(_refreshPromisor.bind(undefined)),
        refreshing: getter(() => !!_refreshingPromise),
        session: getter(() => _session),
        signal: getter(() => _refreshingSignal),
    });
};

export default createSessionRefresher;
