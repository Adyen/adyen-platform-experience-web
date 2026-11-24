import {
    DEFAULT_SESSION_REAUTH_THROTTLE_MS,
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
import { isSessionExpiredError } from './errors';
import { createEventEmitter, isFunction, noop } from '@integration-components/utils';
import type { SessionEventType, SessionSpecification } from './types';

// Declaration merging is used here to type runtime-defined class members
// (`http`, `on`, and `refresh` are assigned in the constructor) without
// emitting class field initializers. This pattern is also compatible with
// Playwright's babel transformer, which cannot parse `declare` class fields.
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface SessionContext<T, HttpParams extends any[] = any[]> {
    http: SessionContext<T, HttpParams>['_sessionHttp'];
    on: ReturnType<typeof createEventEmitter<SessionEventType>>['on'];
    refresh: ReturnType<typeof createSessionRefresher<T>>['refresh'];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class SessionContext<T, HttpParams extends any[] = any[]> {
    private _session: T | undefined;
    private _deadlineRefresh: Promise<void> | undefined;

    // Neither successful requests nor regular refreshes reset this. A new session typically makes
    // components request again (e.g. after the setup endpoints refresh), so resetting it would let an
    // endpoint that keeps responding with an expired-token error loop again.
    private _lastReauthAt = -Infinity;

    private readonly _autofresh;
    private readonly _deadline;
    private readonly _refresher;

    private readonly _eventEmitter = createEventEmitter<SessionEventType>();

    constructor(private readonly _specification: SessionSpecification<T, HttpParams>) {
        this._deadline = createSessionDeadline(this._eventEmitter, this._specification as SessionSpecification<T>);
        this._refresher = createSessionRefresher(this._eventEmitter, this._specification as SessionSpecification<T>);
        this._autofresh = createSessionAutofresher(this._refresher);

        this._deadline.on(INTERNAL_EVT_SESSION_DEADLINE, () => this._eventEmitter.emit(EVT_SESSION_EXPIRED));
        this._refresher.on(INTERNAL_EVT_SESSION_REFRESHING_START, () => this._eventEmitter.emit(EVT_SESSION_REFRESHING_START));
        this._refresher.on(INTERNAL_EVT_SESSION_REFRESHING_END, () => this._eventEmitter.emit(EVT_SESSION_REFRESHING_END));

        this._refresher.on(INTERNAL_EVT_SESSION_READY, () => {
            this._session = this._refresher.session;
            this._deadlineRefresh = this._deadline.refresh(this._session).finally(() => this._eventEmitter.emit(EVT_SESSION_REFRESHED));
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

    private get _reauthThrottleMs() {
        const throttleMs = this._specification.reauthThrottleMs;
        return Number.isFinite(throttleMs) && throttleMs! >= 0 ? throttleMs! : DEFAULT_SESSION_REAUTH_THROTTLE_MS;
    }

    private _assertSessionHttp(value: any): asserts value is NonNullable<SessionSpecification<T, HttpParams>['http']> {
        if (!isFunction(value)) throw ERR_SESSION_HTTP_UNAVAILABLE;
    }

    private async _sessionHttp(
        beforeHttp?: ((currentSession: T | undefined, signal: AbortSignal, ...args: HttpParams) => any) | null,
        ...args: HttpParams
    ) {
        this._autofresh(true);

        let canRetry = true;
        let expiredSession: { value: T | undefined } | undefined;

        while (true) {
            let session: T | undefined;

            try {
                // Capturing the rejection also silences unnecessary unhandled promise rejection warnings
                const refreshFailure = await this._refresher.promise.then(noop, (reason: unknown) => ({ reason }));

                // A failed refresh leaves the expired session in place. Retrying with it would only
                // get another expired-token response and hide why the session could not be recovered.
                if (refreshFailure && expiredSession && expiredSession.value === this._session) throw refreshFailure.reason;

                // A deadline refresh replaces an elapsed deadline signal. Without waiting for it,
                // a retry could reuse the aborted signal of the session that just expired.
                await this._deadlineRefresh?.catch(noop);

                const { signal } = this._deadline;

                await beforeHttp?.(this._session, signal, ...args);
                this._assertSessionHttp(this._specification.http);

                session = this._session;
                return await this._specification.http(session, signal, ...args);
            } catch (ex) {
                if (!isSessionExpiredError(ex) || !canRetry) throw ex;

                // Retry at most once per request, so that a session which keeps getting
                // expired-token responses (e.g. 401) fails the request instead of looping.
                canRetry = false;
                expiredSession = { value: session };

                // Skip when another request already replaced (or is replacing) the session,
                // otherwise concurrent expired-token responses would each create a session.
                if (session === this._session && !this._refresher.refreshing) {
                    const now = Date.now();
                    if (now - this._lastReauthAt < this._reauthThrottleMs) throw ex;

                    this._lastReauthAt = now;
                    if (!this._refresher.pending) this._deadline.elapse();

                    // Refresh directly instead of relying on autofresh, which may be disabled
                    this._refresher.refresh().catch(noop);
                }
            }
        }
    }
}

export default SessionContext;
