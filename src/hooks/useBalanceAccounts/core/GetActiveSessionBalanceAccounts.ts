import { IBalanceAccountBase } from '../../../types';
import { EMPTY_ARRAY, EMPTY_OBJECT, getMappedValue, isFunction } from '../../../utils';
import sessionReady from '../../../core/Auth/session/utils/sessionReady';
import AuthSession from '../../../core/Auth/session/AuthSession';

type BalanceAccount = Readonly<IBalanceAccountBase>;
type ActiveSessionBalanceAccounts = readonly BalanceAccount[] | undefined;

interface GetActiveSessionBalanceAccounts {
    (): Promise<ActiveSessionBalanceAccounts>;
    get accounts(): NonNullable<ActiveSessionBalanceAccounts>;
    get error(): Error | undefined;
    fresh(): Promise<ActiveSessionBalanceAccounts>;
    reset(): void;
}

export const ERR_BALANCE_ACCOUNTS_UNAVAILABLE = 'BALANCE_ACCOUNTS_UNAVAILABLE';
export const ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED = 'GET_BALANCE_ACCOUNTS_UNAUTHORIZED';

const GetActiveSessionBalanceAccountsFactoriesMap = new WeakMap<AuthSession, GetActiveSessionBalanceAccounts>();
const EMPTY_BALANCE_ACCOUNTS: ActiveSessionBalanceAccounts = null!;

/**
 * Utility for fetching the list of balance accounts for the active session fresh from the backend server.
 *
 * If the session is expired (currently inactive), it will first initiate a session refresh or wait for any pending
 * refresh before attempting to fetch balance accounts from the server (leveraging the `sessionReady()` utility).
 *
 * If the session expires while fetching the balance accounts is in progress and a new session refresh was already
 * initiated, then it waits for the pending refresh to be completed before attempting the fetch again.
 *
 * @param session The `AuthSession` instance for which to get the list of balance accounts
 */
export async function getActiveSessionBalanceAccounts(session: AuthSession): Promise<readonly BalanceAccount[]> {
    // Wait for any pending session refresh to be completed
    // Initiates a refresh if session is already expired
    await sessionReady(session);

    const { getBalanceAccounts } = session.context.endpoints;

    if (!isFunction(getBalanceAccounts)) {
        // The `getBalanceAccounts` endpoint was not included in the setup response
        // The user associated with the session does not have sufficient roles/permissions
        throw new Error(ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED);
    }

    try {
        const balanceAccounts: BalanceAccount[] = (await getBalanceAccounts(EMPTY_OBJECT)).data;
        return Object.freeze(balanceAccounts.map(Object.freeze) as BalanceAccount[]);
    } catch {
        if (session.context.refreshing) {
            // Could be the case that session got expired while the fetch is in progress,
            // and a new session refresh was already initiated by some other part of the system.
            // Try again after the pending session refresh.
            return getActiveSessionBalanceAccounts(session);
        }

        // Could not obtain balance accounts data from the server
        // Possibly as a result of malformed data, network errors, etc.
        throw new Error(ERR_BALANCE_ACCOUNTS_UNAVAILABLE);
    }
}

/**
 * Higher-order function that returns a shared `GetActiveSessionBalanceAccounts` function (with caching behavior) for
 * the specified auth session. The returned `getBalanceAccounts` function, whenever called, will fetch the list the
 * balance accounts for the associated auth session at least once per active session.
 *
 * By default, the returned `GetActiveSessionBalanceAccounts` function will fetch balance accounts form the server the
 * first time for an active session, after which it continues to return the cached result (until the session expires or
 * the cache is invalidated).
 *
 * The returned `GetActiveSessionBalanceAccounts` function exposes the following properties and methods:
 *  - `accounts`
 *      > Readonly property for getting the array of balance accounts last fetched from the server. Accessing this
 *      property always returns an array (which can be empty, especially in cases when there are no balance accounts).
 *
 *  - `error`
 *      > Readonly property for getting the latest error that occurred as a result of fetching from the server. This
 *      property is initially `null`, and is reset to this initial `null` value after every successful fetch.
 *
 *  - `fresh()`
 *      > Always fetches directly from the server, and returns a fresh list of balance accounts.
 *
 *  - `reset()`
 *      > Clears the cached result, so that the next call to the function fetches directly from the server. This method
 *      is idempotent in behavior, since calling it multiple times has only the same effect.
 *
 * @param session The `AuthSession` instance for which to get its associated `GetActiveSessionBalanceAccounts` function
 */
function createGetActiveSessionBalanceAccountsFactory(session: AuthSession) {
    let cachedBalanceAccounts: ActiveSessionBalanceAccounts = EMPTY_BALANCE_ACCOUNTS;
    let currentBalanceAccounts: NonNullable<ActiveSessionBalanceAccounts> = EMPTY_ARRAY;
    let currentError: Error | null = null;

    const fetchBalanceAccounts = () => {
        resetCachedBalanceAccounts();
        return getBalanceAccounts();
    };

    const resetCachedBalanceAccounts = () => {
        cachedBalanceAccounts = EMPTY_BALANCE_ACCOUNTS;
    };

    async function getBalanceAccounts() {
        try {
            if (cachedBalanceAccounts === EMPTY_BALANCE_ACCOUNTS) {
                cachedBalanceAccounts = (await getActiveSessionBalanceAccounts(session)) ?? undefined;
                currentBalanceAccounts = cachedBalanceAccounts ?? EMPTY_ARRAY;
                currentError = null;
            }
        } catch (ex) {
            currentError = ex as Error;
            throw ex;
        }
        return cachedBalanceAccounts;
    }

    session.subscribe(() => {
        if (session.context.isExpired) {
            resetCachedBalanceAccounts();
        }
    });

    return Object.defineProperties(getBalanceAccounts as GetActiveSessionBalanceAccounts, {
        accounts: { get: () => currentBalanceAccounts },
        error: { get: () => currentError },
        fresh: { value: fetchBalanceAccounts },
        reset: { value: resetCachedBalanceAccounts },
    });
}

export function getActiveSessionBalanceAccountsFactory(session: AuthSession) {
    return getMappedValue(session, GetActiveSessionBalanceAccountsFactoriesMap, createGetActiveSessionBalanceAccountsFactory)!;
}

export default getActiveSessionBalanceAccounts;
