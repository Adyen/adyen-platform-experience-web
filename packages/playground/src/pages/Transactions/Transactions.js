import { getMyTransactions } from '../../utils/services';
import { AdyenFP, transactionList } from '@Adyen/adyen-fp-web';
import '@Adyen/adyen-fp-web/dist/adyen-fp.css';
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
                onFilterChange: async (state, component) => {
                    const transactions = await getMyTransactions(state.filters);
                    component.update({ transactions });
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
            })
            .mount('.transactions-component-container');
    } catch (e) {
        console.error(e);
    }
})();
