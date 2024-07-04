import clock from '../../time/clock';
import { createAbortable } from '../../async/abortable';
import { createPromisor } from '../../async/promisor';
import { createEventEmitter } from '../../reactive/eventEmitter';
import { isWatchlistUnsubscribeToken } from '../../reactive/watchlist';
import { ALREADY_RESOLVED_PROMISE, boolOrFalse, falsify, isFunction, isUndefined, noop, parseDate, tryResolve } from '../../../utils';
import type { SessionEventType, SessionSpecification } from './types';
import {
    ERR_SESSION_EXPIRED,
    ERR_SESSION_FACTORY_UNAVAILABLE,
    ERR_SESSION_HTTP_UNAVAILABLE,
    ERR_SESSION_REFRESH_ABORTED,
    ERR_SESSION_INVALID,
    EVT_SESSION_EXPIRED_STATE_CHANGE,
    EVT_SESSION_REFRESHING_STATE_CHANGE,
} from './constants';

export class SessionContext<T, HttpParams extends any[] = any[]> {
    private _expired = false;
    private _refreshing = false;
    private _refreshCount = 0;
    private _refreshEventPending = false;
    private _refreshingPromise: Promise<void> | undefined;
    private _refreshPending = false;

    private _session: T | undefined;
    private _sessionActivationTimestamp: number | undefined;
    private _sessionExpirationTimestamp: number | undefined;
    private _stopSessionClock: (() => void) | undefined;

    private readonly _eventEmitter = createEventEmitter<SessionEventType>();
    private readonly _refreshAbortable = createAbortable(ERR_SESSION_REFRESH_ABORTED);

    private readonly _sessionPromisor = createPromisor(function (this: SessionContext<T, HttpParams>, _, session: T) {
        this._expired = this._refreshPending = false;
        this._eventEmitter.emit(EVT_SESSION_EXPIRED_STATE_CHANGE);
        return session;
    });

    public declare http: typeof this._sessionHttp;
    public declare on: (typeof this._eventEmitter)['on'];
    public declare refresh: typeof this._refreshSession;

    constructor(private readonly _specification: SessionSpecification<T, HttpParams>) {
        this.http = this._sessionHttp.bind(this);
        this.on = this._eventEmitter.on;
        this.refresh = this._refreshSession.bind(this);
    }

    get isExpired() {
        return this._sessionIsExpired();
    }

    get refreshing() {
        return this._refreshing;
    }

    get timestamp() {
        return this._sessionActivationTimestamp;
    }

    private _assertRefreshNotInterruptedByAbort(signal: AbortSignal, err: any = Symbol()) {
        // Passing a unique symbol as default value for omitted `err` argument ensures that this check
        // will always return the `aborted` status of the signal
        if (this._refreshInterruptedByAbort(signal, err)) {
            throw this._refreshAbortable.reason!;
        }
    }

    private _assertSession(value: any): asserts value is T {
        try {
            this._specification.assert?.(value);
        } catch (ex) {
            throw ERR_SESSION_INVALID;
        }
    }

    private _assertSessionFactory(value: any): asserts value is NonNullable<SessionSpecification<T>['onRefresh']> {
        if (!isFunction(value)) throw ERR_SESSION_FACTORY_UNAVAILABLE;
    }

    private _assertSessionHttp(value: any): asserts value is NonNullable<SessionSpecification<T, HttpParams>['http']> {
        if (!isFunction(value)) throw ERR_SESSION_HTTP_UNAVAILABLE;
    }

    private async _canFulfillPendingSessionRefresh() {
        const canRefresh = await tryResolve(async () => {
            const _autoRefresh = this._specification.autoRefresh;
            return isFunction(_autoRefresh) ? _autoRefresh.call(this._specification, this._session) : _autoRefresh;
        }).catch(falsify);

        return boolOrFalse(canRefresh);
    }

    private async _fulfillPendingSessionRefresh(skipCanRefreshCheck = false) {
        if (!boolOrFalse(skipCanRefreshCheck) && !(await this._canFulfillPendingSessionRefresh())) return;
        if (!this._refreshPending || this._refreshCount > 0) return;
        // no-op catch callback ensures that unnecessary unhandled rejection warnings are silenced.
        this._refreshSession().catch(noop);
    }

    private async _getNextSession(signal: AbortSignal) {
        this._assertSessionFactory(this._specification.onRefresh);
        const nextSession = await this._specification.onRefresh(this._session, signal);

        this._assertRefreshNotInterruptedByAbort(signal);
        this._assertSession(nextSession);
        return nextSession;
    }

    private _onSessionExpired(refreshImmediately = false) {
        if (this._refreshPending) return;

        this._stopSessionClock?.();
        this._expired = this._refreshPending = true;
        this._eventEmitter.emit(EVT_SESSION_EXPIRED_STATE_CHANGE);

        if (boolOrFalse(refreshImmediately)) {
            // attempt immediate refresh (if necessary)
            this._fulfillPendingSessionRefresh().catch(noop);
        }
    }

    private _refreshInterruptedByAbort(signal: AbortSignal, err?: any): err is typeof this._refreshAbortable.reason {
        return err === this._refreshAbortable.reason! || signal.aborted;
    }

    private async _refreshSession() {
        this._sessionPromisor.refresh();
        this._refreshAbortable.abort();
        this._refreshAbortable.refresh();
        this._refreshCount++;

        // Capture the current abort signal for this session refresh request
        const signal = this._refreshAbortable.signal;

        await (this._refreshingPromise ??= (async () => {
            if (!this._refreshing) {
                this._refreshing = true;

                // Await an already resolved promise to defer the dispatch of a new `refreshChange` event
                // Should be sufficient to ensure that any pending `refreshChange` event gets dispatched first
                if (this._refreshEventPending) await ALREADY_RESOLVED_PROMISE;

                this._eventEmitter.emit(EVT_SESSION_REFRESHING_STATE_CHANGE);
            }
        })());

        try {
            const nextSession = await Promise.race([this._getNextSession(signal), this._refreshAbortable.promise]).catch(reason => {
                this._assertRefreshNotInterruptedByAbort(signal, reason);
                throw reason;
            });

            this._assertRefreshNotInterruptedByAbort(signal);
            await this._setupSessionClock(nextSession);
            await this._sessionPromisor((this._session = nextSession));
        } finally {
            /* Finally block to ensure that control flow always reaches here. */

            // The session refresh completion steps should run only once
            // Only for the last session refresh request
            if (!signal.aborted && this._refreshing) {
                this._refreshEventPending = true;
                this._refreshingPromise = undefined;
                this._refreshing = false;
                this._refreshCount = 0;

                // Await an already resolved promise to defer the dispatch of a new `refreshChange` event
                // Should be sufficient to ensure that the `expireChange` event gets dispatched first
                await ALREADY_RESOLVED_PROMISE;

                this._refreshEventPending = false;
                this._eventEmitter.emit(EVT_SESSION_REFRESHING_STATE_CHANGE);
            }
        }
    }

    private async _sessionHttp(...args: HttpParams) {
        await this._fulfillPendingSessionRefresh(true);

        while (true) {
            try {
                const session = await this._sessionPromisor.promise;
                this._assertSessionHttp(this._specification.http);
                return await this._specification.http(session, this._refreshAbortable.signal, ...args);
            } catch (ex) {
                if (ex !== ERR_SESSION_EXPIRED) throw ex;
                this._onSessionExpired(true);
            }
        }
    }

    private _sessionIsExpired() {
        return this._expired || (this._verifyPassedSessionDeadline() && this._expired);
    }

    private async _setupSessionClock(session: T) {
        try {
            this._sessionActivationTimestamp = Date.now();
            this._sessionExpirationTimestamp = undefined;
            this._sessionExpirationTimestamp = parseDate(await this._specification.deadline?.(session));

            if (isUndefined(this._sessionExpirationTimestamp)) return;

            this._stopSessionClock?.();

            let unsubscribeClock = clock.subscribe(snapshotOrSignal => {
                if (isWatchlistUnsubscribeToken(snapshotOrSignal)) return this._stopSessionClock?.();
                if (this._verifyPassedSessionDeadline(snapshotOrSignal.now)) this._fulfillPendingSessionRefresh();
            });

            this._stopSessionClock = () => {
                unsubscribeClock?.();
                unsubscribeClock = this._stopSessionClock = undefined!;
            };
        } catch {
            /* ignore session deadline determination errors */
        }
    }

    private _verifyPassedSessionDeadline(timestamp = Date.now()) {
        if (isUndefined(this._sessionExpirationTimestamp)) return;
        if (timestamp >= this._sessionExpirationTimestamp) this._onSessionExpired();
        return true;
    }
}

export default SessionContext;
