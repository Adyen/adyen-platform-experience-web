import { IBalanceAccountBase } from '../../../types';
import { EMPTY_OBJECT, getMappedValue, isFunction } from '../../../utils';
import sessionReady from '../../../core/Auth/session/utils/sessionReady';
import AuthSession from '../../../core/Auth/session/AuthSession';

type BalanceAccount = Readonly<IBalanceAccountBase>;
type ActiveSessionBalanceAccounts = readonly BalanceAccount[] | undefined;

interface GetActiveSessionBalanceAccounts {
    invalidate(): void;
    refresh(): Promise<ActiveSessionBalanceAccounts>;
    (): Promise<ActiveSessionBalanceAccounts>;
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
 * Higher-order function that returns a shared `getBalanceAccounts()` function (with caching behavior) for the provided
 * auth session. The returned `getBalanceAccounts` function, whenever called, will fetch the list the balance accounts
 * for the associated auth session at least once per active session.
 *
 * By default, the returned `getBalanceAccounts` function will fetch balance accounts form the server the first time
 * for an active session, after which it continues to return the cached result subsequently (until the session expires
 * or the cache is invalidated).
 *
 * The returned `getBalanceAccounts` function exposes the following methods (for more control over caching behavior):
 *  - `invalidate()`
 *      > Clears the cached result, so that the next call to the function fetches directly from the server
 *
 *  - `refresh()`
 *      > Always fetches directly from the server, and returns a fresh list of balance accounts
 *
 * @param session The `AuthSession` instance for which to get the cached getBalanceAccounts() function
 */
function createGetActiveSessionBalanceAccountsFactory(session: AuthSession) {
    let currentBalanceAccounts = EMPTY_BALANCE_ACCOUNTS;

    const fetchBalanceAccounts = () => {
        resetCurrentBalanceAccounts();
        return getBalanceAccounts();
    };

    const resetCurrentBalanceAccounts = () => {
        currentBalanceAccounts = EMPTY_BALANCE_ACCOUNTS;
    };

    async function getBalanceAccounts() {
        if (currentBalanceAccounts === EMPTY_BALANCE_ACCOUNTS) {
            currentBalanceAccounts = (await getActiveSessionBalanceAccounts(session)) ?? undefined;
        }
        return currentBalanceAccounts;
    }

    session.subscribe(() => {
        if (session.context.isExpired) {
            resetCurrentBalanceAccounts();
        }
    });

    return Object.defineProperties(getBalanceAccounts as GetActiveSessionBalanceAccounts, {
        invalidate: { value: resetCurrentBalanceAccounts },
        refresh: { value: fetchBalanceAccounts },
    });
}

export function getActiveSessionBalanceAccountsFactory(session: AuthSession) {
    return getMappedValue(session, GetActiveSessionBalanceAccountsFactoriesMap, createGetActiveSessionBalanceAccountsFactory)!;
}

export default getActiveSessionBalanceAccounts;
