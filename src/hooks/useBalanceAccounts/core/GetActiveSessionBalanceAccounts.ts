import { Core } from '../../../core';
import { IBalanceAccountBase } from '../../../types';
import { EMPTY_OBJECT, getMappedValue, isFunction } from '../../../utils';
import sessionReady from '../../../core/Auth/session/utils/sessionReady';

type CoreInstance = Core<any, any>;
type BalanceAccount = Readonly<IBalanceAccountBase>;
type ActiveSessionBalanceAccounts = readonly BalanceAccount[] | undefined;

interface GetActiveSessionBalanceAccounts {
    invalidate(): void;
    refresh(): Promise<ActiveSessionBalanceAccounts>;
    (): Promise<ActiveSessionBalanceAccounts>;
}

export const EMPTY_BALANCE_ACCOUNTS: ActiveSessionBalanceAccounts = null!;
export const ERR_BALANCE_ACCOUNTS_UNAVAILABLE = 'BALANCE_ACCOUNTS_UNAVAILABLE';
export const ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED = 'GET_BALANCE_ACCOUNTS_UNAUTHORIZED';

const GetActiveSessionBalanceAccountsFactoriesMap = new WeakMap<CoreInstance, GetActiveSessionBalanceAccounts>();

export async function getActiveSessionBalanceAccounts(
    core: CoreInstance,
    currentBalanceAccounts = EMPTY_BALANCE_ACCOUNTS
): Promise<ActiveSessionBalanceAccounts> {
    async function _getActiveSessionBalanceAccounts(session: CoreInstance['session']) {
        if (session.context.isExpired !== false) {
            await sessionReady(session);
        } else if (currentBalanceAccounts !== EMPTY_BALANCE_ACCOUNTS) {
            return currentBalanceAccounts;
        }

        const { getBalanceAccounts } = session.context.endpoints;

        try {
            return Object.freeze((await getBalanceAccounts!(EMPTY_OBJECT)).data.map(Object.freeze) as BalanceAccount[]);
        } catch {
            if (session.context.refreshing) {
                // Attempting to refresh session
                // Try again after session refresh
                return _getActiveSessionBalanceAccounts(session);
            }

            throw new Error(isFunction(getBalanceAccounts) ? ERR_BALANCE_ACCOUNTS_UNAVAILABLE : ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED);
        }
    }

    const balanceAccounts = await _getActiveSessionBalanceAccounts(core.session);
    return balanceAccounts ?? undefined;
}

function createGetActiveSessionBalanceAccountsFactory(core: CoreInstance) {
    let currentBalanceAccounts = EMPTY_BALANCE_ACCOUNTS;

    const fetchBalanceAccounts = () => {
        resetCurrentBalanceAccounts();
        return getBalanceAccounts();
    };

    const resetCurrentBalanceAccounts = () => void (currentBalanceAccounts = EMPTY_BALANCE_ACCOUNTS);

    async function getBalanceAccounts() {
        currentBalanceAccounts = await getActiveSessionBalanceAccounts(core, currentBalanceAccounts);
        return currentBalanceAccounts;
    }

    return Object.defineProperties(getBalanceAccounts as GetActiveSessionBalanceAccounts, {
        invalidate: { value: resetCurrentBalanceAccounts },
        refresh: { value: fetchBalanceAccounts },
    });
}

export function getActiveSessionBalanceAccountsFactory(core: CoreInstance) {
    return getMappedValue(core, GetActiveSessionBalanceAccountsFactoriesMap, createGetActiveSessionBalanceAccountsFactory)!;
}

export default getActiveSessionBalanceAccounts;
