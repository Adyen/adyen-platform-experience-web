import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, all_locales, PayoutsOverview } from '../../../src';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

enableServerInMockedMode()
    .then(async () => {
        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

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
        });

        payoutsComponent.mount('.payouts-overview-container');
    })
    .catch(console.error);
