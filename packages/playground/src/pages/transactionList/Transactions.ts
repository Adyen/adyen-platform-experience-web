import { AdyenFP, TransactionsComponent, all_locales } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { TEST_CONFIG } from '../../utils/utils';
import { createLanguageButtons } from '../../utils/createLanguageButtons';

enableServerInMockedMode()
    .then(async () => {
        let locale: 'en-US' | 'es-ES' = 'en-US' as const;

        const adyenFP = await AdyenFP({
            loadingContext: process.env.VITE_API_URL,
            locale: locale,
            availableTranslations: [all_locales],
        });

        createLanguageButtons({ locales: ['es-ES', 'en-US'], core: adyenFP });

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
