import { createContext, toChildArray } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { ErrorMessageDisplay } from '../../components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { TranslationKey } from '../../translations';
import { AuthSession } from './session/AuthSession';
import { isWatchlistUnsubscribeToken } from '../../primitives/reactive/watchlist';
import { asyncNoop, EMPTY_OBJECT, isUndefined, noop } from '../../utils';
import hasAdequatePermission from './session/utils/hasAdequatePermission';
import type { AuthProviderProps, SetupContext } from './types';

const AuthContext = createContext<AuthSession['context'] & Pick<AuthSession, 'http' | 'refresh'>>({
    endpoints: EMPTY_OBJECT,
    hasError: false,
    http: asyncNoop,
    isExpired: undefined,
    isFrozen: false,
    refresh: noop,
    refreshing: false,
});

const getComponentEndpoint = (type: string): keyof SetupContext['endpoints'] | undefined => {
    switch (type) {
        case 'payouts':
            return 'getPayouts';
        case 'payoutDetails':
            return 'getPayout';
        case 'transactions':
            return 'getTransactions';
        case 'transactionDetails':
            return 'getTransaction';
        case 'reports':
            return 'getReports';
        default:
            return undefined;
    }
};

const getErrorByType = (type: string): TranslationKey => {
    switch (type) {
        case 'payouts':
            return 'weCouldNotLoadThePayoutsOverview';
        case 'transactions':
            return 'weCouldNotLoadTheTransactionsOverview';
        default:
            return 'somethingWentWrong';
    }
};

export const AuthProvider = ({ children, session, type }: AuthProviderProps) => {
    const { http, refresh } = useMemo(() => session, [session]);
    const [, setContextCounter] = useState(0);
    const [unsubscribeCounter, setUnsubscribeCounter] = useState(0);
    const [hasPermission, setHasPermission] = useState<undefined | boolean>();

    useEffect(() => {
        hasAdequatePermission(type, session).then(setHasPermission);
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
                    <ErrorMessageDisplay withImage centered title={'somethingWentWrong'} message={[getErrorByType(type), 'contactSupportForHelp']} />
                ))}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
export default useAuthContext;
