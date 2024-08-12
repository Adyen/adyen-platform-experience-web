import { AdyenPlatformExperience, all_locales, PayoutsOverview } from '../../../src';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../../mocks/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';

// const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

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
