import type { AuthSession } from './session/AuthSession';
import type { ExternalComponentType } from '../../components/types';
import sessionAwareComponentAvailability from './session/utils/sessionAwareComponentAvailability';
import { isWatchlistUnsubscribeToken } from '../../primitives/reactive/watchlist';
import { noop } from '../../utils';

export function createConfigContextValue(session: AuthSession) {
    const { context, http, refresh } = session;
    return { ...context, http, refresh };
}

export function checkComponentPermission(type: ExternalComponentType, session: AuthSession): Promise<boolean> {
    return sessionAwareComponentAvailability(type, session);
}

export interface ConfigControllerSnapshot {
    contextValue: ReturnType<typeof createConfigContextValue>;
    hasPermission: boolean | undefined;
}

export interface ConfigController {
    connect(onChange: () => void): () => void;
    getSnapshot(): ConfigControllerSnapshot;
}

export function createConfigController(
    session: AuthSession,
    type: ExternalComponentType,
    getPermission: typeof checkComponentPermission = checkComponentPermission
): ConfigController {
    let hasPermission: boolean | undefined;

    return {
        connect(onChange) {
            let connected = true;
            let unsubscribe = noop;

            const resubscribe = () => {
                unsubscribe();

                if (!connected) return;

                unsubscribe = subscribeToSession(session, {
                    onContextChange: onChange,
                    onUnsubscribe: resubscribe,
                });
            };

            resubscribe();

            void getPermission(type, session).then(nextHasPermission => {
                if (!connected || hasPermission === nextHasPermission) return;

                hasPermission = nextHasPermission;
                onChange();
            });

            return () => {
                connected = false;
                unsubscribe();
            };
        },
        getSnapshot() {
            return {
                contextValue: createConfigContextValue(session),
                hasPermission,
            };
        },
    };
}

export interface SessionSubscriptionCallbacks {
    onContextChange: () => void;
    onUnsubscribe: () => void;
}

export function subscribeToSession(session: AuthSession, callbacks: SessionSubscriptionCallbacks): () => void {
    return session.subscribe(maybeContext => {
        if (isWatchlistUnsubscribeToken(maybeContext)) {
            callbacks.onUnsubscribe();
        } else {
            callbacks.onContextChange();
        }
    });
}
