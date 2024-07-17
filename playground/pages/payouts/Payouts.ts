import { AdyenPlatformExperience, all_locales, PayoutsOverview } from '../../../src';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';

// const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

enableServerInMockedMode()
    .then(async () => {
        const locale: 'en-US' | 'es-ES' = 'en-US' as const;

        const AdyenPlatform = await AdyenPlatformExperience({
            locale: locale,
            environment: 'test',
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await sessionRequest();
            },
        });
        createLanguageButtons({ locales: ['es-ES', 'en-US'], core: AdyenPlatform });

        const payoutsComponent = new PayoutsOverview({
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
            allowLimitSelection: true,
            preferredLimit: 10,
            ...TEST_CONFIG,
        });

        payoutsComponent.mount('.payouts-overview-container');
    })
    .catch(console.error);
