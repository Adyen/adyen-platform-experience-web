import AuthSession from '../AuthSession';
import { isWatchlistUnsubscribeToken } from '../../../../primitives/reactive/watchlist';
import { createDeferred } from '../../../../primitives/async/deferred';
import { boolOrTrue } from '../../../../utils';

const sessionReady = async (session: AuthSession) => {
    const ready = createDeferred<void>();
    const readyPromise = ready.promise;
    const refreshInProgress = session.context.refreshing;
    let didTriggerRefresh: boolean | undefined = undefined;
    let canRefreshSession: boolean | undefined = undefined;

    let sessionUnsubscribe = session.subscribe(maybeUnsubscribeToken => {
        if (isWatchlistUnsubscribeToken(maybeUnsubscribeToken)) {
            ready.resolve();
            return;
        }

        didTriggerRefresh ??= session.context.refreshing;

        if (session.context.refreshing) return;

        if (boolOrTrue(session.context.isExpired)) {
            if ((canRefreshSession ??= !(refreshInProgress || didTriggerRefresh))) {
                canRefreshSession = false;
                session.refresh();
                return;
            }
        }

        // Session has been refreshed (likely to have an active session)
        ready.resolve();
    });

    readyPromise.finally(() => {
        sessionUnsubscribe();
        sessionUnsubscribe = null!;
    });

    return readyPromise;
};

export default sessionReady;
