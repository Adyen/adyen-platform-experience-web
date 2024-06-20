import {
    EVT_SESSION_EXPIRED,
    EVT_SESSION_REFRESHED,
    EVT_SESSION_REFRESHING_END,
    EVT_SESSION_REFRESHING_START,
    SessionContext,
} from '../../../primitives/context/session';
import AuthSetupContext from './AuthSetupContext';
import AuthSessionSpecification from './AuthSessionSpecification';
import { createAbortable } from '../../../primitives/async/abortable';
import { createErrorContainer } from '../../../primitives/auxiliary/errorContainer';
import { createEventEmitter } from '../../../primitives/reactive/eventEmitter';
import { createWatchlist } from '../../../primitives/reactive/watchlist';
import { ERR_AUTH_REFRESH_ABORTED, ERR_AUTH_REFRESH_FAILED, EVT_AUTH_STATE_CHANGE } from './constants';
import { boolOrFalse, constant, isFunction, noop } from '../../../utils';
import type { Promised } from '../../../utils/types';

export class AuthSession {
    private _canSkipSessionRefresh = false;
    private _lastSessionContextRefreshTimestamp: (typeof this._sessionContext)['timestamp'];
    private _overrideRefreshInProgress = false;
    private _refreshInProgress = false;

    private readonly _errorContainer = createErrorContainer();
    private readonly _eventEmitter = createEventEmitter<typeof EVT_AUTH_STATE_CHANGE>();
    private readonly _refreshAbortable = createAbortable(ERR_AUTH_REFRESH_ABORTED);

    private readonly _specification = new AuthSessionSpecification();
    private readonly _sessionContext = new SessionContext(this._specification);
    private readonly _setupContext = new AuthSetupContext(this._sessionContext);

    private readonly _watchlist = createWatchlist({
        endpoints: () => this._setupContext.endpoints,
        hasError: () => this._errorContainer.hasError,
        http: constant(this._sessionContext.http.bind(this._sessionContext)),
        isExpired: () => this._sessionContext.isExpired,
        refresh: constant(this._overrideRefresh.bind(this)),
        refreshing: () => this._sessionContext.refreshing,
    });

    declare destroy: () => void;
    declare subscribe: (typeof this._watchlist)['subscribe'];

    constructor() {
        this.destroy = () => {
            this._watchlist.on.resume = undefined;
            this._watchlist.cancelSubscriptions();
        };

        const _onAuthStateChanged = this._onAuthStateChanged.bind(this);
        const _onSessionExpiredStateChange = this._onSessionExpiredStateChange.bind(this);

        this._refreshAbortablePromise = this._refreshAbortablePromise.bind(this);
        this.subscribe = this._watchlist.subscribe;

        this._watchlist.on.resume = () => {
            let listeners = [
                this._eventEmitter.on(EVT_AUTH_STATE_CHANGE, this._watchlist.requestNotification),
                this._sessionContext.on(EVT_SESSION_EXPIRED, _onSessionExpiredStateChange),
                this._sessionContext.on(EVT_SESSION_REFRESHED, _onSessionExpiredStateChange),
                this._sessionContext.on(EVT_SESSION_REFRESHING_END, _onAuthStateChanged),
                this._sessionContext.on(EVT_SESSION_REFRESHING_START, _onAuthStateChanged),
            ];

            this._watchlist.on.idle = () => {
                this._watchlist.on.idle = undefined;
                listeners.forEach(cancel => cancel());
                listeners.length = 0;
                listeners = undefined!;
            };

            this._refresh();
        };
    }

    get context() {
        return this._watchlist.snapshot;
    }

    set loadingContext(loadingContext: typeof this._setupContext.loadingContext) {
        this._setupContext.loadingContext = loadingContext;
    }

    set onSessionCreate(onSessionCreate: typeof this._specification.onSessionCreate) {
        if (this._specification.onSessionCreate === onSessionCreate) return;

        this._specification.onSessionCreate = onSessionCreate;
        if (!this._refreshInProgress) return;

        if (isFunction(this._specification.onSessionCreate)) {
            this._canSkipSessionRefresh = false;
            this._overrideRefresh();
        }
    }

    private _onAuthStateChanged() {
        this._eventEmitter.emit(EVT_AUTH_STATE_CHANGE);
    }

    private _onSessionExpiredStateChange() {
        const { timestamp } = this._sessionContext;

        /* Update `this._canSkipSessionRefresh` flag based on session timestamp comparison */
        if ((this._canSkipSessionRefresh = this._lastSessionContextRefreshTimestamp !== timestamp)) {
            // Since `this._canSkipSessionRefresh` is `true`, session context is active (not expired)
            this._lastSessionContextRefreshTimestamp = timestamp;
            this._errorContainer.reset();
            this._overrideRefresh();
        }

        this._onAuthStateChanged();
    }

    private _overrideRefresh(skipSessionRefresh = this._canSkipSessionRefresh) {
        this._overrideRefreshInProgress = true;
        this._refresh(skipSessionRefresh);
    }

    private _refresh(skipSessionRefresh = false) {
        if (this._refreshInProgress && !this._overrideRefreshInProgress) return;

        if (this._overrideRefreshInProgress) {
            this._overrideRefreshInProgress = false;
            this._refreshAbortable.abort();
            this._refreshAbortable.refresh();
        }

        this._refreshInProgress = true;

        const refreshPromise =
            boolOrFalse(skipSessionRefresh) && this._canSkipSessionRefresh
                ? this._refreshSetupContext()
                : this._refreshAbortablePromise(this._sessionContext.refresh);

        refreshPromise.catch(noop);
    }

    private async _refreshSetupContext() {
        let _setupRefreshAborted = false;

        await this._setupContext
            .refresh(this._refreshAbortablePromise)
            .then(
                () => this._errorContainer.reset(),
                err => (_setupRefreshAborted = err !== ERR_AUTH_REFRESH_FAILED)
            )
            .then(() => {
                this._refreshInProgress = _setupRefreshAborted;
                this._onAuthStateChanged();
            });
    }

    private async _refreshAbortablePromise<T>(getPromise: Promised<T> | ((signal: AbortSignal) => Promised<T>)) {
        const signal = this._refreshAbortable.signal;

        return (async () => {
            const awaitablePromise = isFunction(getPromise) ? getPromise(signal) : getPromise;
            const awaited = await Promise.race([awaitablePromise, this._refreshAbortable.promise]);

            // if aborted — ignore the awaited value
            // throw an exception to redirect the control flow
            if (signal.aborted) throw void 0;

            return awaited;
        })().catch(ex => {
            if (signal.aborted) throw ERR_AUTH_REFRESH_ABORTED;
            this._errorContainer.set(ex);
            throw ERR_AUTH_REFRESH_FAILED;
        });
    }
}

export default AuthSession;
