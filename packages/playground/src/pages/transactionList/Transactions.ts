import { getMyTransactions } from '../../utils/services';
import { AdyenFP, transactionList } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

try {
    const adyenFP = await AdyenFP();

    const transactions = await getMyTransactions();

    adyenFP
        .create(transactionList, {
            transactions,
            onFilterChange: (/* filters, component */) => {
                // do something here with the updated filters
                // avoid refetching the transactions here
            },
            onTransactionSelected: ({ id }) => {
                window.location.assign(`/transaction/?id=${id}`);
            },
            onBalanceAccountSelected: ({ id }) => {
                window.location.assign(`/balanceAccount/?id=${id}`);
            },
            onAccountSelected: ({ id }) => {
                window.location.assign(`/accountHolder/?id=${id}`);
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
