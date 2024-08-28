import { AdyenPlatformExperience, TransactionsOverview, all_locales } from '../../../src';
import '../../utils/createPages';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../../mocks/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';
import getMyCustomData from '../../utils/customDataRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';

enableServerInMockedMode()
    .then(async () => {
        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            translations: {
                'en-US': {
                    _store: 'Store',
                    _product: 'Product',
                },
                'es-ES': {
                    _store: 'Tienda',
                    _product: 'Producto',
                },
            },
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        createLanguageButtons({ core });

        const transactionsComponent = new TransactionsOverview({
            core,
            availableTranslations: [],
            allowLimitSelection: true,
            onContactSupport: () => {},
            onFiltersChanged: (/* filters */) => {
                // do something here with the updated filters
            },
            onRecordSelection: ({ showModal }) => {
                showModal();
                // window.location.assign(`/src/pages/transaction/?id=${id}`);
            },
            preferredLimit: 10,
            columns: ['amount', '_store', 'createdAt', '_product', 'paymentMethod', 'transactionType'],
            onDataRetrieved: async ({ data }) => {
                const customData = await getMyCustomData(data);
                return customData;
            },
            ...TEST_CONFIG,
        });

        transactionsComponent.mount('.transactions-component-container');
    })
    .catch(console.error);
