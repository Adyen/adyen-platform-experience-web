import { AdyenFP, TransactionsComponent, all_locales } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { TEST_CONFIG } from '../../utils/utils';
import { createLanguageButtons } from '../../utils/createLanguageButtons';

const getMySessionToken = async () => {
    return Promise.resolve({ id: '18fbb75e-b53b-40c3-88a4-3a1b7cc92bd1', token: Math.random().toString(), clientKey: Math.random().toString() });
};

enableServerInMockedMode()
    .then(async () => {
        let locale: 'en-US' | 'es-ES' = 'en-US' as const;

        const adyenFP = await AdyenFP({
            loadingContext: process.env.VITE_API_URL,
            locale: locale,
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await getMySessionToken();
                // return { sessionToken: session, clientKey };
            }
        });

        createLanguageButtons({ locales: ['es-ES', 'en-US'], core: adyenFP });

        const transactionsComponent = new TransactionsComponent({
            core: adyenFP,
            balancePlatformId: process.env.VITE_BALANCE_PLATFORM ?? '',
            withTitle: true,
            onTransactionSelected: ({ showModal }) => {
                showModal();
                // window.location.assign(`/src/pages/transaction/?id=${id}`);
            },
            onFiltersChanged: (/* filters */) => {
                // do something here with the updated filters
            },
            onLimitChanged: (/* limit */) => {
                // do something here with the updated limit
            },
            allowLimitSelection: true,
            preferredLimit: 10,
            ...TEST_CONFIG,
        });

        const transactionsComponent2 = new TransactionsComponent({
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
        transactionsComponent2.mount('.transactions-component-container-2');
    })
    .catch(console.error);
