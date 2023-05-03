import { getMyTransactions } from '../../utils/services';
import { AdyenFP, transactionList } from '@adyen/adyen-fp-web';
import '@adyen/adyen-fp-web/dist/adyen-fp-web.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';

(async () => {
    try {
        const transactions = await getMyTransactions();
        const adyenFP = await AdyenFP();

        adyenFP
            .create(transactionList, {
                transactions,
                onFilterChange: (/* filters, component */) => {
                    // do something here with the updated filters
                    // avoid refetching the transactions here
                },
                onTransactionSelected: ({ id }) => {
                    window.location.assign(`/transaction?id=${id}`);
                },
                onBalanceAccountSelected: ({ id }) => {
                    window.location.assign(`/balanceaccount?id=${id}`);
                },
                onAccountSelected: ({ id }) => {
                    window.location.assign(`/accountholder?id=${id}`);
                },
                updateTransactions: async (params, component) => {
                    const transactions = await getMyTransactions(params);
                    component.update({ transactions });
                }
            })
            .mount('.transactions-component-container');
    } catch (e) {
        console.error(e);
    }
})();
