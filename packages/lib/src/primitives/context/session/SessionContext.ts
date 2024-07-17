import {
    ERR_SESSION_EXPIRED,
    ERR_SESSION_HTTP_UNAVAILABLE,
    EVT_SESSION_EXPIRED,
    EVT_SESSION_READY,
    EVT_SESSION_REFRESHED,
    EVT_SESSION_REFRESHING_END,
    EVT_SESSION_REFRESHING_START,
} from './constants';
import {
    INTERNAL_EVT_SESSION_DEADLINE,
    INTERNAL_EVT_SESSION_READY,
    INTERNAL_EVT_SESSION_REFRESHING_END,
    INTERNAL_EVT_SESSION_REFRESHING_START,
} from './internal/constants';
import { createSessionAutofresher } from './internal/autofresher';
import { createSessionDeadline } from './internal/deadline';
import { createSessionRefresher } from './internal/refresher';
import { createEventEmitter } from '../../reactive/eventEmitter';
import { isFunction, noop } from '../../../utils';
import type { SessionEventType, SessionSpecification } from './types';

export class SessionContext<T, HttpParams extends any[] = any[]> {
    private _session: T | undefined;

    private readonly _autofresh;
    private readonly _deadline;
    private readonly _refresher;

    private readonly _eventEmitter = createEventEmitter<SessionEventType>();

    public declare readonly http: typeof this._sessionHttp;
    public declare readonly on: (typeof this._eventEmitter)['on'];
    public declare readonly refresh: (typeof this._refresher)['refresh'];

    constructor(private readonly _specification: SessionSpecification<T, HttpParams>) {
        this._deadline = createSessionDeadline(this._eventEmitter, this._specification);
        this._refresher = createSessionRefresher(this._eventEmitter, this._specification);
        this._autofresh = createSessionAutofresher(this._refresher);

        this._deadline.on(INTERNAL_EVT_SESSION_DEADLINE, () => this._eventEmitter.emit(EVT_SESSION_EXPIRED));
        this._refresher.on(INTERNAL_EVT_SESSION_REFRESHING_START, () => this._eventEmitter.emit(EVT_SESSION_REFRESHING_START));
        this._refresher.on(INTERNAL_EVT_SESSION_REFRESHING_END, () => this._eventEmitter.emit(EVT_SESSION_REFRESHING_END));

        this._refresher.on(INTERNAL_EVT_SESSION_READY, () => {
            this._session = this._refresher.session;
            this._deadline.refresh(this._session).finally(() => this._eventEmitter.emit(EVT_SESSION_REFRESHED));
            this._eventEmitter.emit(EVT_SESSION_READY);
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

    private _assertSessionHttp(value: any): asserts value is NonNullable<SessionSpecification<T, HttpParams>['http']> {
        if (!isFunction(value)) throw ERR_SESSION_HTTP_UNAVAILABLE;
    }

    private async _sessionHttp(
        beforeHttp?: ((currentSession: T | undefined, signal: AbortSignal, ...args: HttpParams) => any) | null,
        ...args: HttpParams
    ) {
        let _signal: AbortSignal | undefined;
        this._autofresh(true);

        while (true) {
            try {
                // a no-op catch callback is used here (`noop`),
                // to silence unnecessary unhandled promise rejection warnings
                await this._refresher.promise.catch(noop);

                _signal = this._deadline.signal;

                await beforeHttp?.(this._session, _signal, ...args);
                this._assertSessionHttp(this._specification.http);

                return await this._specification.http(this._session, _signal, ...args);
            } catch (ex) {
                if (ex !== ERR_SESSION_EXPIRED && !(_signal && _signal.aborted)) throw ex;
                if (this._refresher.pending) continue;
                this._deadline.elapse();
            }
        }
    }
}

export default SessionContext;
