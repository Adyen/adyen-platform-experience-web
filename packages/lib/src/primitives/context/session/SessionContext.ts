import { isFunction } from '../../../utils';
import { INTERNAL_EVT_SESSION_READY } from './internal/constants';
import { createSessionDeadlineController } from './internal/deadline';
import { createSessionRefreshController } from './internal/refresh';
import { createEventEmitter } from '../../reactive/eventEmitter';
import { ERR_SESSION_HTTP_UNAVAILABLE, EVT_SESSION_REFRESHING_START } from './constants';
import type { SessionEventType, SessionSpecification } from './types';

export class SessionContext<T, HttpParams extends any[] = any[]> {
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

        this._refreshController.on(INTERNAL_EVT_SESSION_READY, async ({ detail: session, timeStamp }) => {
            this._session = session ?? undefined;
            this._sessionActivationTimestamp = timeStamp;
            this._deadlineController.refresh(this._session);
        });

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

    private async _sessionHttp(...args: HttpParams) {
        void this._refreshController.autoRefresh(true);

        while (true) {
            try {
                const session = await this._refreshController.promise;
                this._assertSessionHttp(this._specification.http);
                return await this._specification.http(session, this._refreshController.signal!, ...args);
            } catch (ex) {
                this._refreshController.errorRefresh(ex);
            }
        }
    }
}

export default SessionContext;
