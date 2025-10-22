import SetupContext from './SetupContext';
import AuthSessionSpecification from './AuthSessionSpecification';
import { ERR_SESSION_REFRESH_ABORTED, EVT_SESSION_EXPIRED, EVT_SESSION_READY, SessionContext } from '../../../primitives/context/session';
import { createErrorContainer } from '../../../primitives/auxiliary/errorContainer';
import { createPromisor } from '../../../primitives/async/promisor';
import { createWatchlist } from '../../../primitives/reactive/watchlist';
import { boolOrFalse, boolOrTrue, isFunction } from '../../../utils';

import type { onErrorHandler } from '../../types';

export class AuthSession {
    private _canSkipSessionRefresh = false;
    private _refreshPromisorSignal: AbortSignal | undefined;
    private _sessionIsFrozen = false;

    private readonly _errorContainer = createErrorContainer();
    private readonly _specification = new AuthSessionSpecification();
    private readonly _sessionContext = new SessionContext(this._specification);
    private readonly _setupContext = new SetupContext(this._sessionContext);

    private readonly _refreshPromisor = createPromisor(async (signal, skipSessionRefreshIfPossible = false) => {
        let authStateChanged = !this._refreshPromisorSignal;
        let isLatestRefresh = this._refreshPromisorSignal === (this._refreshPromisorSignal = signal);
        const onlySetupRefresh = boolOrFalse(skipSessionRefreshIfPossible) && this._canSkipSessionRefresh;

        if (authStateChanged) {
            authStateChanged = false;
            this._errorContainer.reset();
            this._onAuthStateChanged();
        }

        try {
            await (onlySetupRefresh ? this._setupContext : this._sessionContext)
                .refresh(signal)
                .finally(() => (isLatestRefresh = this._refreshPromisorSignal === signal));
        } catch (ex) {
            if (!isLatestRefresh) return;
            if (!signal.aborted && (onlySetupRefresh || ex !== ERR_SESSION_REFRESH_ABORTED)) this._errorContainer.set(ex);
            authStateChanged = !onlySetupRefresh;
        } finally {
            if (authStateChanged || (onlySetupRefresh && isLatestRefresh)) {
                this._refreshPromisorSignal = undefined;
                this._onAuthStateChanged();
            }
        }
    });

    private readonly _watchlist = createWatchlist({
        endpoints: () => this._setupContext.endpoints,
        extraConfig: () => this._setupContext.extraConfig,
        hasError: () => this._errorContainer.hasError,
        isExpired: () => this._sessionContext.isExpired,
        isFrozen: () => this._sessionIsFrozen,
        refreshing: () => !!this._refreshPromisorSignal,
    });

    public readonly freeze = () => {
        this._sessionIsFrozen = true;
        this._watchlist.on.resume = undefined;
        this._watchlist.cancelSubscriptions();
    };

    public readonly http = this._sessionContext.http.bind(this._sessionContext, null);
    public readonly refresh = this._refresh.bind(this);
    public readonly subscribe = this._watchlist.subscribe;

    constructor() {
        this._watchlist.on.resume = () => {
            const unlisteners = [
                this._sessionContext.on(EVT_SESSION_EXPIRED, () => {
                    this._canSkipSessionRefresh = false;
                    this._onAuthStateChanged();
                }),

                this._sessionContext.on(EVT_SESSION_READY, () => {
                    void this._refresh((this._canSkipSessionRefresh = true));
                }),
            ];

            this._watchlist.on.idle = () => {
                this._watchlist.on.idle = undefined;
                unlisteners.forEach(unlisten => unlisten());
                unlisteners.length = 0;
            };

            if (!this.context.refreshing && boolOrTrue(this.context.isExpired)) {
                this._refresh();
            }
        };
    }

    get context() {
        return this._watchlist.snapshot;
    }

    set loadingContext(loadingContext: typeof this._setupContext.loadingContext) {
        this._setupContext.loadingContext = loadingContext;
    }

    set analyticsPayload(payload: Array<URLSearchParams>) {
        this._setupContext.analyticsPayload = payload;
    }

    set errorHandler(errorHandler: onErrorHandler | null) {
        this._specification.errorHandler = errorHandler;
    }

    set onSessionCreate(onSessionCreate: typeof this._specification.onSessionCreate) {
        if (this._specification.onSessionCreate === onSessionCreate) return;

        this._specification.onSessionCreate = onSessionCreate;
        if (!this._refreshPromisorSignal) return;

        if (isFunction(this._specification.onSessionCreate)) {
            this._canSkipSessionRefresh = false;
            this._refresh();
        }
    }

    private _onAuthStateChanged() {
        this._watchlist.requestNotification();
    }

    private _refresh(skipSessionRefreshIfPossible = false) {
        void this._refreshPromisor(skipSessionRefreshIfPossible);
    }
}

export default AuthSession;
