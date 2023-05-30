import { CoreOptions } from './core/types';
import Core from './core';
import accountHolder from './components/AccountHolder';
import balanceAccount from './components/BalanceAccount';
import transactionList from './components/Transactions';
import transactionDetails from './components/TransactionDetails';

export async function AdyenFP(props?: CoreOptions): Promise<Core> {
    const core = new Core(props ?? {});
    return await core.initialize();
}

export { accountHolder, balanceAccount, transactionList, transactionDetails };
