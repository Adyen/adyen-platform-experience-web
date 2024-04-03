import { AdyenPlatformExperience, TransactionsOverview, all_locales } from '@adyen/adyen-platform-experience-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { TEST_CONFIG } from '../../utils/utils';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';

enableServerInMockedMode()
    .then(async () => {
        let locale: 'en-US' | 'es-ES' = 'en-US' as const;

        const AdyenPlatform = await AdyenPlatformExperience({
            locale: locale,
            environment: 'test',
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        // createLanguageButtons({ locales: ['es-ES', 'en-US'], core: AdyenPlatform });

        const transactionsComponent = new TransactionsOverview({
            core: AdyenPlatform,
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
