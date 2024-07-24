import { AdyenPlatformExperience, TransactionsOverview, all_locales } from '../../../src';
import '../../utils/createPages';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../../mocks/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';

enableServerInMockedMode()
    .then(async () => {
        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            async onSessionCreate() {
                return await sessionRequest();
            },
            //themeColors: { primary: '#2292bc', outline: '#1e506a', neutral: '#2d3251', background: '#151726', label: '#ebebeb' },
        });

        createLanguageButtons({ core });

        const transactionsComponent = new TransactionsOverview({
            core,
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
            ...TEST_CONFIG,
        });

        transactionsComponent.mount('.component-element');
    })
    .catch(console.error);
