import { getMyTransactions } from '../../utils/services';
import { AdyenFP, transactionList } from '@adyen/adyen-fp-web';
import '../../../config/polyfills';
import '../../../createPages.js';
import '../../assets/style/style.scss';

(async () => {
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
                onTransactionSelected: ({ id }: { id: string }) => {
                    window.location.assign(`/transaction/?id=${id}`);
                },
                onBalanceAccountSelected: ({ id }: { id: string }) => {
                    window.location.assign(`/balanceAccount/?id=${id}`);
                },
                onAccountSelected: ({ id }: { id: string }) => {
                    window.location.assign(`/accountHolder/?id=${id}`);
                },
                onUpdateTransactions: async (params: Record<string, any>, component: any) => {
                    const transactions = await getMyTransactions(params);
                    component.update({ transactions });
                },
            })
            .mount('.transactions-component-container');
    } catch (e) {
        console.error(e);
    }
})();
