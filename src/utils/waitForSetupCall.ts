import AuthSession from '../core/Auth/session/AuthSession';
import { createDeferred } from '../primitives/async/deferred';

export const waitForSetup = async (session: AuthSession) => {
    const waitDeferred = createDeferred<void>();

    const unsubscribeSession = session.subscribe(() => {
        if (session.context.refreshing || session.context.isExpired) return;
        // Session have been refreshed (and we likely have an active session)
        waitDeferred.resolve();
        unsubscribeSession();
    });

    await waitDeferred.promise;
};
