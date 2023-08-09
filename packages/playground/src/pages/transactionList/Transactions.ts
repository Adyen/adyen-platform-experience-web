import { getMyTransactions } from '../../utils/services';
import { AdyenFP } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

try {
    await enableServerInMockedMode();

    const adyenFP = await AdyenFP();

    const transactions = await getMyTransactions();

    adyenFP
        .create('transactionList', {
            transactions,
            onFilterChange: (/* filters, component */) => {
                // do something here with the updated filters
                // avoid refetching the transactions here
            },
            onTransactionSelected: ({ id }) => {
                window.location.assign(`/src/pages/transaction/?id=${id}`);
            },
            onBalanceAccountSelected: ({ id }) => {
                window.location.assign(`/src/pages/balanceAccount/?id=${id}`);
            },
            onAccountSelected: ({ id }) => {
                window.location.assign(`/src/pages/accountHolder/?id=${id}`);
            },
            onUpdateTransactions: async (params, component) => {
                const transactions = await getMyTransactions(params);
                component?.update({ transactions });
            },
        })
        .mount('.transactions-component-container');
} catch (e) {
    console.error(e);
}
