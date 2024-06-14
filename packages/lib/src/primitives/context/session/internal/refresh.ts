import { createPromisor } from '../../../async/promisor';
import { createEventEmitter, Emitter } from '../../../reactive/eventEmitter';
import { ALREADY_RESOLVED_PROMISE, enumerable, getter, isFunction, isUndefined, noop, struct, tryResolve } from '../../../../utils';
import { ERR_SESSION_FACTORY_UNAVAILABLE, ERR_SESSION_INVALID, ERR_SESSION_REFRESH_ABORTED, EVT_SESSION_REFRESHING_STATE_CHANGE } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionEventEmitter, SessionRefreshManager } from './types';

export const createSessionRefreshManager = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _refreshingEventPending = false;
    let _refreshingPromise: Promise<void> | undefined;
    let _refreshingSignal: AbortSignal;
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

    const _refreshPromisor = createPromisor(async (signal: AbortSignal) => {
        _refreshingSignal = signal;

        if (isUndefined(_refreshingPromise)) {
            _refreshingPromise = (async () => {
                if (_refreshingEventPending) {
                    // Defer dispatching `EVT_SESSION_REFRESHING_STATE_CHANGE` event
                    // Ensuring that pending `EVT_SESSION_EXPIRED_STATE_CHANGE` events get dispatched first
                    await ALREADY_RESOLVED_PROMISE;
                }

                emitter.emit(EVT_SESSION_REFRESHING_STATE_CHANGE);
            })();
        }

        try {
            await _refreshingPromise;
            _assertSessionFactory(specification.onRefresh);

            const session = await tryResolve(() => specification.onRefresh(_session, signal)).finally(() => {
                if (signal.aborted) throw ERR_SESSION_REFRESH_ABORTED;
            });

            _assertSession(session);
            _sessionEmitter.emit('session', session!);
            return (_session = session);
        } finally {
            /* Control flow will always enter this block */

            // The session refresh completion steps should run only once
            // Only for the last session refresh request
            if (_refreshingSignal === signal) {
                _refreshingEventPending = true;
                _refreshingPromise = undefined;

                // Defer dispatching `EVT_SESSION_REFRESHING_STATE_CHANGE` event
                // Ensuring that pending `EVT_SESSION_EXPIRED_STATE_CHANGE` events get dispatched first
                await ALREADY_RESOLVED_PROMISE;

                _refreshingEventPending = false;
                emitter.emit(EVT_SESSION_REFRESHING_STATE_CHANGE);
            }
        }
    });

    return struct<SessionRefreshManager<T>>({
        on: enumerable(_sessionEmitter.on),
        promise: getter(() => _refreshPromisor.promise),
        refresh: enumerable(() => void _refreshPromisor().catch(noop)),
        refreshing: getter(() => !!_refreshingPromise),
        session: getter(() => _session),
        signal: getter(() => _refreshingSignal),
    });
};

export default createSessionRefreshManager;
