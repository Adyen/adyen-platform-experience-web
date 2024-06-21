import {
    ERR_SESSION_EXPIRED,
    ERR_SESSION_HTTP_UNAVAILABLE,
    EVT_SESSION_EXPIRED,
    EVT_SESSION_REFRESHING_END,
    EVT_SESSION_REFRESHING_START,
} from './constants';
import { createSessionDeadlineController } from './internal/deadline';
import { createSessionRefreshController } from './internal/refresh';
import { createEventEmitter } from '../../reactive/eventEmitter';
import { boolOrFalse, falsify, isFunction, noop, tryResolve } from '../../../utils';
import type { SessionEventType, SessionSpecification } from './types';

export class SessionContext<T, HttpParams extends any[] = any[]> {
    private _refreshPending = false;
    private _session: T | undefined;
    private _sessionActivationTimestamp: number | undefined;

    private readonly _deadlineController;
    private readonly _refreshController;
    private readonly _eventEmitter = createEventEmitter<SessionEventType>();

    declare http: typeof this._sessionHttp;
    declare on: (typeof this._eventEmitter)['on'];
    declare refresh: (typeof this._refreshController)['refresh'];

    constructor(private readonly _specification: SessionSpecification<T, HttpParams>) {
        this._deadlineController = createSessionDeadlineController(this._eventEmitter, this._specification);
        this._refreshController = createSessionRefreshController(this._eventEmitter, this._specification);

        this._refreshController.on('session', async ({ detail: session, timeStamp }) => {
            this._session = session ?? undefined;
            this._sessionActivationTimestamp = timeStamp;
            this._deadlineController.refresh(this._session);
        });

        this._eventEmitter.on(EVT_SESSION_EXPIRED, () => void (this._refreshPending = true));
        this._eventEmitter.on(EVT_SESSION_REFRESHING_END, () => void (this._refreshPending = false));
        this._eventEmitter.on(EVT_SESSION_REFRESHING_START, this._deadlineController.abort);

        this.http = this._sessionHttp.bind(this);
        this.on = this._eventEmitter.on;
        this.refresh = this._refreshController.refresh;
    }

    get isExpired() {
        return this._deadlineController.elapsed;
    }

    get refreshing() {
        return this._refreshController.refreshing;
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

    private async _sessionHttp(...args: HttpParams) {
        await this._fulfillPendingSessionRefresh(true);

        while (true) {
            try {
                const session = await this._refreshController.promise;
                this._assertSessionHttp(this._specification.http);
                return await this._specification.http(session, this._refreshController.signal!, ...args);
            } catch (ex) {
                if (ex !== ERR_SESSION_EXPIRED) throw ex;
                if (this._refreshPending) continue;
                // no-op catch callback to silence unnecessary unhandled rejection warnings
                this._fulfillPendingSessionRefresh().catch(noop);
                this._eventEmitter.emit(EVT_SESSION_EXPIRED);
            }
        }
    }
}

export default SessionContext;
