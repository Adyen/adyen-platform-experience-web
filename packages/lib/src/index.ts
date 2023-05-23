/*eslint-disable */
if (process.env.NODE_ENV === 'development') {
    // Must use require here as import statements are only allowed
    // to exist at the top of a file.
    // require('preact/debug');
}

import { CoreOptions } from './core/types';
import Core from './core';
import accountHolder from './components/AccountHolder';
import balanceAccount from './components/BalanceAccount';
import transactionList from './components/Transactions';
import transactionDetails from './components/TransactionDetails';
/* eslint-enable */

export async function AdyenFP(props?: CoreOptions): Promise<Core> {
    const core = new Core(props ?? {});
    return await core.initialize();
}

export { accountHolder, balanceAccount, transactionList, transactionDetails };
