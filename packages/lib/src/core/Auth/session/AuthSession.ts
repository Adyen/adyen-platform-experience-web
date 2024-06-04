import AuthSetupContext from './AuthSetupContext';
import AuthSessionSpecification from './AuthSessionSpecification';
import { createAbortable } from '../../../primitives/async/abortable';
import { createErrorContainer } from '../../../primitives/common/errorContainer';
import { createEventEmitter } from '../../../primitives/reactive/eventEmitter';
import { createWatchlist } from '../../../primitives/reactive/watchlist';
import { EVT_SESSION_EXPIRED_STATE_CHANGE, EVT_SESSION_REFRESHING_STATE_CHANGE, SessionContext } from '../../../primitives/context/session';
import { ERR_AUTH_REFRESH_ABORTED, ERR_AUTH_REFRESH_FAILED, EVT_AUTH_STATE_CHANGE } from './constants';
import { ALREADY_RESOLVED_PROMISE, boolOrFalse, constant, isFunction, noop } from '../../../utils';
import type { Promised } from 'src/utils/types';

export class AuthSession {
    private _canSkipSessionRefresh = false;
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
        refresh: constant(this._refresh.bind(this)),
        refreshing: () => this._sessionContext.refreshing,
    });

    declare destroy: () => void;
    declare subscribe: (typeof this._watchlist)['subscribe'];

    constructor() {
        this.destroy = () => {
            this._watchlist.on.resume = undefined;
            this._watchlist.cancelSubscriptions();
        };

        this.subscribe = this._watchlist.subscribe;
        this._refreshAbortablePromise = this._refreshAbortablePromise.bind(this);
        this._initialize();
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
            this._overrideRefreshInProgress = true;
            this._refresh();
        }
    }

    private _initialize() {
        const _hasError = () => this._errorContainer.hasError || this._refreshAbortable.signal.aborted;

        const _updateRefreshing = (refreshing: boolean) => {
            this._refreshInProgress = boolOrFalse(refreshing);
            this._eventEmitter.emit(EVT_AUTH_STATE_CHANGE);
        };

        const _onSessionExpiredStateChange = () => {
            if (this._sessionContext.isExpired === true || _hasError()) {
                this._canSkipSessionRefresh = false;
                this._watchlist.requestNotification();
            } else {
                this._canSkipSessionRefresh = true;
                this._setupContext
                    .refresh(this._refreshAbortablePromise)
                    .then(
                        () => (this._canSkipSessionRefresh = false),
                        err => {
                            if (err !== ERR_AUTH_REFRESH_FAILED) throw err;
                        }
                    )
                    .then(() => _updateRefreshing(false), noop);
            }
        };

        const _onSessionRefreshingStateChange = () => {
            if (this._sessionContext.refreshing) {
                !this._refreshInProgress && _updateRefreshing(true);
            } else if (_hasError()) {
                _updateRefreshing(false);
            }
        };

        this._watchlist.on.resume = () => {
            let listeners = [
                this._eventEmitter.on(EVT_AUTH_STATE_CHANGE, this._watchlist.requestNotification),
                this._sessionContext.on(EVT_SESSION_REFRESHING_STATE_CHANGE, _onSessionRefreshingStateChange),
                this._sessionContext.on(EVT_SESSION_EXPIRED_STATE_CHANGE, _onSessionExpiredStateChange),
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

    private _refresh(setupRefresh = false) {
        if (this._refreshInProgress && !this._overrideRefreshInProgress) return;

        if (this._overrideRefreshInProgress) {
            this._overrideRefreshInProgress = false;
            this._refreshAbortable.abort();
            this._refreshAbortable.refresh();
        } else {
            this._errorContainer.reset();
        }

        this._refreshAbortablePromise(
            boolOrFalse(setupRefresh) && this._canSkipSessionRefresh ? ALREADY_RESOLVED_PROMISE : this._sessionContext.refresh()
        ).catch(noop);
    }

    private async _refreshAbortablePromise<T>(getPromise: Promised<T> | ((signal: AbortSignal) => Promised<T>)) {
        // capture the current abort signal
        const signal = this._refreshAbortable.signal;

        try {
            const awaited = await Promise.race([isFunction(getPromise) ? getPromise(signal) : getPromise, this._refreshAbortable.promise]);

            if (signal.aborted) {
                // ignore the awaited value
                // throw an exception to redirect the control flow
                throw void 0;
            }

            return awaited;
        } catch (ex) {
            if (signal.aborted) throw ERR_AUTH_REFRESH_ABORTED;
            this._errorContainer.set(ex);
            throw ERR_AUTH_REFRESH_FAILED;
        }
    }
}

export default AuthSession;
