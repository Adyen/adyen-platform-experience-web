import { createContext, toChildArray } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { AuthSession } from './session/AuthSession';
import { isWatchlistUnsubscribeToken } from '../../primitives/reactive/watchlist';
import { asyncNoop, EMPTY_OBJECT, noop } from '../../utils';
import type { AuthProviderProps } from './types';

const AuthContext = createContext<AuthSession['context'] & Pick<AuthSession, 'http' | 'refresh'>>({
    endpoints: EMPTY_OBJECT,
    hasError: false,
    http: asyncNoop,
    isExpired: undefined,
    refresh: noop,
    refreshing: false,
});

export const AuthProvider = ({ children, session }: AuthProviderProps) => {
    const { http, refresh } = useMemo(() => session, [session]);
    const [, setContextCounter] = useState(0);
    const [unsubscribeCounter, setUnsubscribeCounter] = useState(0);

    useEffect(() => {
        return session.subscribe(maybeContext => {
            const stateUpdater = isWatchlistUnsubscribeToken(maybeContext) ? setUnsubscribeCounter : setContextCounter;
            stateUpdater(count => count + 1);
        });
    }, [unsubscribeCounter, session]);

    return <AuthContext.Provider value={{ ...session.context, http, refresh }}>{toChildArray(children)}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
export default useAuthContext;
