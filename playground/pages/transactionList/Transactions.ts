import { AdyenPlatformExperience, TransactionsOverview, all_locales } from '../../../src';
import '../../utils/createPages';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';

enableServerInMockedMode()
    .then(async () => {
        const core = await AdyenPlatformExperience({
            environment: 'test',
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        createLanguageButtons({ core });

        const transactionsComponent = new TransactionsOverview({
            core,
            onRecordSelection: ({ showModal }) => {
                showModal();
                // window.location.assign(`/src/pages/transaction/?id=${id}`);
            },
            onFiltersChanged: (/* filters */) => {
                // do something here with the updated filters
            },
            onLimitChanged: (/* limit */) => {
                // do something here with the updated limit
            },
            onContactSupport: () => {},
            allowLimitSelection: true,
            preferredLimit: 10,
            ...TEST_CONFIG,
        });

        transactionsComponent.mount('.transactions-component-container');
    })
    .catch(console.error);
