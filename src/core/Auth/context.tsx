import { createContext, toChildArray } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { ErrorMessageDisplay } from '../../components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { AuthSession } from './session/AuthSession';
import { isWatchlistUnsubscribeToken } from '../../primitives/reactive/watchlist';
import sessionAwareComponentAvailability, { componentAvailabilityErrors } from './session/utils/sessionAwareComponentAvailability';
import { asyncNoop, EMPTY_OBJECT, isUndefined, noop } from '../../utils';
import type { AuthProviderProps } from './types';

const AuthContext = createContext<AuthSession['context'] & Pick<AuthSession, 'http' | 'refresh'>>({
    endpoints: EMPTY_OBJECT,
    hasError: false,
    http: asyncNoop,
    isExpired: undefined,
    isFrozen: false,
    refresh: noop,
    refreshing: false,
});

export const AuthProvider = ({ children, session, type }: AuthProviderProps) => {
    const { http, refresh } = useMemo(() => session, [session]);
    const [, setContextCounter] = useState(0);
    const [unsubscribeCounter, setUnsubscribeCounter] = useState(0);
    const [hasPermission, setHasPermission] = useState<undefined | boolean>();

    useEffect(() => {
        sessionAwareComponentAvailability(type, session).then(setHasPermission);
    }, [session, type]);

    useEffect(() => {
        return session.subscribe(maybeContext => {
            const stateUpdater = isWatchlistUnsubscribeToken(maybeContext) ? setUnsubscribeCounter : setContextCounter;
            stateUpdater(count => count + 1);
        });
    }, [unsubscribeCounter]);

    return (
        <AuthContext.Provider value={{ ...session.context, http, refresh }}>
            {!isUndefined(hasPermission) &&
                (hasPermission ? (
                    toChildArray(children)
                ) : (
                    <ErrorMessageDisplay
                        withImage
                        centered
                        title={'somethingWentWrong'}
                        message={[componentAvailabilityErrors(type), 'contactSupportForHelp']}
                    />
                ))}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
export default useAuthContext;
