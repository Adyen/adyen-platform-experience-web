import clock from '../../time/clock';
import { createSessionDeadlineManager } from './internal/deadline';
import { createSessionRefreshManager } from './internal/refresh';
import { createEventEmitter } from '../../reactive/eventEmitter';
import { isWatchlistUnsubscribeToken } from '../../reactive/watchlist';
import { boolOrFalse, falsify, isFunction, isUndefined, noop, parseDate, tryResolve } from '../../../utils';
import { ERR_SESSION_EXPIRED, ERR_SESSION_HTTP_UNAVAILABLE, EVT_SESSION_EXPIRED_STATE_CHANGE } from './constants';
import type { SessionEventType, SessionSpecification } from './types';

export class SessionContext<T, HttpParams extends any[] = any[]> {
    private _expired = false;
    private _refreshPending = false;

    private _session: T | undefined;
    private _sessionActivationTimestamp: number | undefined;
    private _sessionExpirationTimestamp: number | undefined;
    private _stopSessionClock: (() => void) | undefined;

    private readonly _eventEmitter = createEventEmitter<SessionEventType>();
    private readonly _deadlineManager;
    private readonly _refreshManager;

    declare http: typeof this._sessionHttp;
    declare on: (typeof this._eventEmitter)['on'];
    declare refresh: (typeof this._refreshManager)['refresh'];

    constructor(private readonly _specification: SessionSpecification<T, HttpParams>) {
        this._deadlineManager = createSessionDeadlineManager(this._eventEmitter, this._specification);
        this._refreshManager = createSessionRefreshManager(this._eventEmitter, this._specification);

        this._refreshManager.on('session', async ({ detail: session, timeStamp }) => {
            this._session = session!;
            this._sessionActivationTimestamp = timeStamp;

            await this._setupSessionClock(this._session);

            this._expired = this._refreshPending = false;
            this._eventEmitter.emit(EVT_SESSION_EXPIRED_STATE_CHANGE);
        });

        this.http = this._sessionHttp.bind(this);
        this.on = this._eventEmitter.on;
        this.refresh = this._refreshManager.refresh;
    }

    get isExpired() {
        return this._sessionIsExpired();
    }

    get refreshing() {
        return this._refreshManager.refreshing;
    }

    get timestamp() {
        return this._sessionActivationTimestamp;
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
        if (!this._refreshPending || this.refreshing) return;
        this.refresh();
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

    private async _sessionHttp(...args: HttpParams) {
        await this._fulfillPendingSessionRefresh(true);

        while (true) {
            try {
                const session = await this._refreshManager.promise;
                this._assertSessionHttp(this._specification.http);
                return await this._specification.http(session, this._refreshManager.signal, ...args);
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
