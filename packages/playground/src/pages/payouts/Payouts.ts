import { AdyenPlatformExperience, all_locales, PayoutsOverview } from '@adyen/adyen-platform-experience-web';
import sessionRequest from '../../utils/sessionRequest';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
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
        });

        createLanguageButtons({ core });

        const payoutsComponent = new PayoutsOverview({
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

        payoutsComponent.mount('.payouts-overview-container');
    })
    .catch(console.error);
