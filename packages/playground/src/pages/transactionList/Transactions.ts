import { AdyenFP, TransactionsComponent, es_ES, fr_FR } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { TEST_CONFIG } from '../../utils/utils';

enableServerInMockedMode()
    .then(async () => {
        const adyenFP = await AdyenFP({
            loadingContext: process.env.VITE_API_URL,
            locale: 'en-US',
            availableTranslations: [fr_FR, es_ES],
        });

        const transactionsComponent = new TransactionsComponent({
            core: adyenFP,
            balancePlatformId: process.env.VITE_BALANCE_PLATFORM ?? '',
            onFilterChange: (/* filters, component */) => {
                // do something here with the updated filters
                // avoid refetching the transactions here
            },
            onTransactionSelected: ({ showModal }) => {
                showModal();
                // window.location.assign(`/src/pages/transaction/?id=${id}`);å
            },
            onBalanceAccountSelected: ({ id }) => {
                window.location.assign(`/src/pages/balanceAccount/?id=${id}`);
            },
            onAccountSelected: ({ id }) => {
                window.location.assign(`/src/pages/accountHolder/?id=${id}`);
            },
            ...TEST_CONFIG,
        });

        transactionsComponent.mount('.transactions-component-container');
    })
    .catch(console.error);
