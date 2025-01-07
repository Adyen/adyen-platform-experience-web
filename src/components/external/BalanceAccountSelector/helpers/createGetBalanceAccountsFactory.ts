import { Core } from '../../../../core';
import { IBalanceAccountBase } from '../../../../types';
import sessionReady from '../../../../core/Auth/session/utils/sessionReady';

export const createGetBalanceAccountsFactory = (core: Core<any, any>) => {
    let balanceAccounts: readonly Readonly<IBalanceAccountBase>[] | undefined | null = null;
    const { session } = core;

    const _getBalanceAccounts = async (): Promise<void> => {
        if (session.context.isExpired !== false) await sessionReady(session);
        else if (balanceAccounts !== null) return;

        const { getBalanceAccounts } = session.context.endpoints;

        try {
            balanceAccounts = undefined;
            const accounts = (await getBalanceAccounts!({})).data;
            balanceAccounts = Object.freeze(accounts.map(Object.freeze) as Readonly<IBalanceAccountBase>[]);
        } catch {
            if (session.context.refreshing) {
                // Attempting to refresh session
                // Try again after session refresh
                return _getBalanceAccounts();
            }
            throw new Error(getBalanceAccounts === undefined ? 'UNAUTHORIZED' : 'BALANCE_ACCOUNTS_UNAVAILABLE');
        }
    };

    return async () => {
        await _getBalanceAccounts();
        return balanceAccounts ?? undefined;
    };
};

export default createGetBalanceAccountsFactory;
