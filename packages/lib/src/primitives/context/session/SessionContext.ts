import { isFunction, noop } from '../../../utils';
import { INTERNAL_EVT_SESSION_READY } from './internal/constants';
import { createSessionAutofresher } from './internal/autofresher';
import { createSessionDeadline } from './internal/deadline';
import { createSessionRefresher } from './internal/refresher';
import { createEventEmitter } from '../../reactive/eventEmitter';
import { ERR_SESSION_HTTP_UNAVAILABLE } from './constants';
import type { SessionEventType, SessionSpecification } from './types';

export class SessionContext<T, HttpParams extends any[] = any[]> {
    private _session: T | undefined;
    private _sessionActivationTimestamp: number | undefined;

    private readonly _deadline;
    private readonly _refresher;
    private readonly _autofresher;
    private readonly _eventEmitter = createEventEmitter<SessionEventType>();

    declare http: typeof this._sessionHttp;
    declare on: (typeof this._eventEmitter)['on'];
    declare refresh: (typeof this._refresher)['refresh'];

    constructor(private readonly _specification: SessionSpecification<T, HttpParams>) {
        this._deadline = createSessionDeadline(this._eventEmitter, this._specification);
        this._refresher = createSessionRefresher(this._eventEmitter, this._specification);
        this._autofresher = createSessionAutofresher(this._eventEmitter, this._specification, this._refresher);

        this._refresher.on(INTERNAL_EVT_SESSION_READY, ({ timeStamp }) => {
            this._session = this._refresher.session;
            this._sessionActivationTimestamp = timeStamp;
            this._deadline.refresh(this._session);
        });

        this.http = this._sessionHttp.bind(this);
        this.on = this._eventEmitter.on;
        this.refresh = this._refresher.refresh;
    }

    get isExpired() {
        return this._deadline.elapsed;
    }

    get refreshing() {
        return this._refresher.refreshing;
    }

    get timestamp() {
        return this._sessionActivationTimestamp;
    }

    private _assertSessionHttp(value: any): asserts value is NonNullable<SessionSpecification<T, HttpParams>['http']> {
        if (!isFunction(value)) throw ERR_SESSION_HTTP_UNAVAILABLE;
    }

    private async _sessionHttp(...args: HttpParams) {
        this._assertSessionHttp(this._specification.http);
        this._autofresher.refresh();

        while (true) {
            try {
                // a no-op catch callback is used here (`noop`),
                // to silence unnecessary unhandled promise rejection warnings
                await this._refresher.promise.catch(noop);

                this._assertSessionHttp(this._specification.http);
                return await this._specification.http(this._session, this._refresher.signal!, ...args);
            } catch (ex) {
                // attempt to recover from exception
                this._autofresher.recover(ex);
            }
        }
    }
}

export default SessionContext;
