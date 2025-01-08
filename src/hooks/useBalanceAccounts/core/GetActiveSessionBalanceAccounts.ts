import { Core } from '../../../core';
import { IBalanceAccountBase } from '../../../types';
import { EMPTY_OBJECT, getMappedValue, isFunction } from '../../../utils';
import sessionReady from '../../../core/Auth/session/utils/sessionReady';

type CoreInstance = Core<any, any>;
type BalanceAccount = Readonly<IBalanceAccountBase>;
type ActiveSessionBalanceAccounts = readonly BalanceAccount[] | undefined;

const EMPTY_BALANCE_ACCOUNTS: ActiveSessionBalanceAccounts = null!;
const ERR_BALANCE_ACCOUNTS_UNAVAILABLE = 'BALANCE_ACCOUNTS_UNAVAILABLE';
const ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED = 'GET_BALANCE_ACCOUNTS_UNAUTHORIZED';

const GetActiveSessionBalanceAccountsFactoriesMap = new WeakMap<CoreInstance, ReturnType<typeof createGetActiveSessionBalanceAccountsFactory>>();

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
    return async () => (currentBalanceAccounts = await getActiveSessionBalanceAccounts(core, currentBalanceAccounts));
}

export function getActiveSessionBalanceAccountsFactory(core: CoreInstance) {
    return getMappedValue(core, GetActiveSessionBalanceAccountsFactoriesMap, createGetActiveSessionBalanceAccountsFactory)!;
}

export default getActiveSessionBalanceAccounts;
