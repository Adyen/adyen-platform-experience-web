/*eslint-disable */
if (process.env.NODE_ENV === 'development') {
    // Must use require here as import statements are only allowed
    // to exist at the top of a file.
    // require('preact/debug');
}

import { CoreOptions } from './core/types';
import Core from './core';
import components from './components';

/* eslint-enable */

async function AdyenFP(props: CoreOptions): Promise<Core> {
    const core = new Core(props);
    return await core.initialize();
}

const { accountHolder, balanceAccount, transactionList, transactionDetails } = components;

export { AdyenFP, accountHolder, balanceAccount, transactionList, transactionDetails };
