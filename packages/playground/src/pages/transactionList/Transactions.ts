import { AdyenFP } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { getSearchParameters, TEST_CONFIG } from '../../utils/utils';

enableServerInMockedMode()
    .then(async () => {
        const adyenFP = await AdyenFP({ loadingContext: process.env.VITE_API_URL });

        adyenFP
            .create('transactionList', {
                balancePlatformId: process.env.VITE_BALANCE_PLATFORM ?? '',
                onFilterChange: (/* filters, component */) => {
                    // do something here with the updated filters
                    // avoid refetching the transactions here
                },
                onBalanceAccountSelected: ({ id }) => {
                    window.location.assign(`/src/pages/balanceAccount/?id=${id}`);
                },
                onAccountSelected: ({ id }) => {
                    window.location.assign(`/src/pages/accountHolder/?id=${id}`);
                },
                ...TEST_CONFIG,
            })
            .mount('.transactions-component-container');
    })
    .catch(console.error);
