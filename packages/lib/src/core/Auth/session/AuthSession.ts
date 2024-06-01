import AuthSetupContext from './AuthSetupContext';
import AuthSessionSpecification from './AuthSessionSpecification';
import { createWatchlist } from '../../../primitives/reactive/watchlist';
import { createErrorContainer } from '../../../primitives/common/errorContainer';
import { EVT_SESSION_ACTIVE, EVT_SESSION_INIT, SessionContext } from '../../../primitives/context/session';
import { constant, isFunction } from '../../../utils';
import { EVT_SETUP_INIT } from './constants';

export class AuthSession {
    private _overrideRefreshInProgress = false;
    private _refreshInProgress = false;

    private readonly _errorContainer = createErrorContainer();
    private readonly _specification = new AuthSessionSpecification();
    private readonly _sessionContext = new SessionContext(this._specification);
    private readonly _setupContext = new AuthSetupContext(this._sessionContext);

    private readonly _watchlist = createWatchlist({
        endpoints: () => this._setupContext.endpoints,
        hasError: () => this._errorContainer.hasError || this._setupContext.hasError,
        http: constant(this._sessionContext.http.bind(this._sessionContext)),
        initializing: () => this._sessionContext.refreshing || this._setupContext.refreshing,
        isExpired: () => this._sessionContext.isExpired,
        refresh: constant(this._refresh.bind(this)),
    });

    declare destroy: () => void;
    declare subscribe: (typeof this._watchlist)['subscribe'];

    constructor() {
        this.subscribe = this._watchlist.subscribe;

        this.destroy = () => {
            this._watchlist.on.resume = undefined;
            this._watchlist.cancelSubscriptions();
        };

        this._watchlist.on.resume = () => {
            let listeners = [
                this._sessionContext.on(EVT_SESSION_ACTIVE, this._watchlist.requestNotification),
                this._sessionContext.on(EVT_SESSION_INIT, this._watchlist.requestNotification),
                this._setupContext.on(EVT_SETUP_INIT, this._watchlist.requestNotification),
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
            this._overrideRefreshInProgress = true;
            this._refresh();
        }
    }

    private _refresh() {
        if (this._refreshInProgress && !this._overrideRefreshInProgress) return;

        if (this._overrideRefreshInProgress) {
            this._overrideRefreshInProgress = false;
        } else this._errorContainer.reset();

        this._sessionContext
            .refresh()
            .then(() => this._setupContext.refresh())
            .catch(ex => {
                this._errorContainer.set(ex);
                throw ex;
            });
    }
}

export default AuthSession;
