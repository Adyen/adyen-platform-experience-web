import type { AuthSession } from './session/AuthSession';
import type { ExternalComponentType } from '@integration-components/types';
import { isWatchlistUnsubscribeToken, noop } from '@integration-components/utils';
import sessionAwareComponentAvailability from './session/utils/sessionAwareComponentAvailability';
import sessionReady from './session/utils/sessionReady';

export function createConfigContextValue(session: AuthSession) {
    const { context, http, refresh } = session;
    return { ...context, http, refresh };
}

export async function checkComponentPermission(
    type: ExternalComponentType | undefined,
    session: AuthSession,
    options?: { waitForSession?: boolean }
): Promise<boolean> {
    if (type) return sessionAwareComponentAvailability(type, session, options);
    if (options?.waitForSession !== false) await sessionReady(session);
    return true;
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
    type: ExternalComponentType | undefined,
    getPermission: typeof checkComponentPermission = checkComponentPermission
): ConfigController {
    let hasPermission: boolean | undefined;

    return {
        connect(onChange) {
            let connected = true;
            let permissionCheckId = 0;
            let refreshing = session.context.refreshing;
            let unsubscribe = noop;

            const updatePermission = (options?: { waitForSession?: boolean }) => {
                const checkId = ++permissionCheckId;

                if (hasPermission !== undefined) {
                    hasPermission = undefined;
                    onChange();
                }

                const permission = options ? getPermission(type, session, options) : getPermission(type, session);

                permission
                    .then(nextHasPermission => {
                        if (!connected || checkId !== permissionCheckId || hasPermission === nextHasPermission) return;
                        hasPermission = nextHasPermission;
                        onChange();
                    })
                    .catch(() => {
                        if (!connected || checkId !== permissionCheckId || hasPermission !== false) return;
                        hasPermission = false;
                        onChange();
                    });
            };

            const onContextChange = () => {
                const nextRefreshing = session.context.refreshing;
                const refreshCompleted = refreshing && !nextRefreshing;
                refreshing = nextRefreshing;

                onChange();
                if (refreshCompleted) updatePermission({ waitForSession: false });
            };

            const resubscribe = () => {
                unsubscribe();

                if (!connected) return;

                unsubscribe = subscribeToSession(session, {
                    onContextChange,
                    onUnsubscribe: resubscribe,
                });
            };

            resubscribe();
            updatePermission();

            return () => {
                connected = false;
                permissionCheckId++;
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
