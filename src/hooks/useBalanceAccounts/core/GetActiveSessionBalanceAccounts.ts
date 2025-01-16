import { Core } from '../../../core';
import { IBalanceAccountBase } from '../../../types';
import { EMPTY_OBJECT, getMappedValue, isFunction } from '../../../utils';
import sessionReady from '../../../core/Auth/session/utils/sessionReady';
import AuthSession from '../../../core/Auth/session/AuthSession';

type CoreInstance = Core<any, any>;
type BalanceAccount = Readonly<IBalanceAccountBase>;
type ActiveSessionBalanceAccounts = readonly BalanceAccount[] | undefined;

interface GetActiveSessionBalanceAccounts {
    invalidate(): void;
    refresh(): Promise<ActiveSessionBalanceAccounts>;
    (): Promise<ActiveSessionBalanceAccounts>;
}

export const ERR_BALANCE_ACCOUNTS_UNAVAILABLE = 'BALANCE_ACCOUNTS_UNAVAILABLE';
export const ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED = 'GET_BALANCE_ACCOUNTS_UNAUTHORIZED';

const GetActiveSessionBalanceAccountsFactoriesMap = new WeakMap<CoreInstance, GetActiveSessionBalanceAccounts>();
const EMPTY_BALANCE_ACCOUNTS: ActiveSessionBalanceAccounts = null!;

export async function getActiveSessionBalanceAccounts(session: AuthSession): Promise<readonly BalanceAccount[]> {
    await sessionReady(session);

    const { getBalanceAccounts } = session.context.endpoints;

    if (!isFunction(getBalanceAccounts)) {
        throw new Error(ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED);
    }

    try {
        const balanceAccounts: BalanceAccount[] = (await getBalanceAccounts(EMPTY_OBJECT)).data;
        return Object.freeze(balanceAccounts.map(Object.freeze) as BalanceAccount[]);
    } catch {
        if (session.context.refreshing) {
            // try again after pending session refresh
            return getActiveSessionBalanceAccounts(session);
        }

        throw new Error(ERR_BALANCE_ACCOUNTS_UNAVAILABLE);
    }
}

function createGetActiveSessionBalanceAccountsFactory({ session }: CoreInstance) {
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

export function getActiveSessionBalanceAccountsFactory(core: CoreInstance) {
    return getMappedValue(core, GetActiveSessionBalanceAccountsFactoriesMap, createGetActiveSessionBalanceAccountsFactory)!;
}

export default getActiveSessionBalanceAccounts;
