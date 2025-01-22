import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, all_locales, CapitalOverview } from '../../../src';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

enableServerInMockedMode()
    .then(async () => {
        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            async onSessionCreate() {
                return await sessionRequest({ accountHolderId: 'AH3294C223227N5KXMG7K758H' });
            },
        });

        const capitalOverviewComponent = new CapitalOverview({
            core,
            onFundsRequest: () => {
                let currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('alert', 'true');
                window.location.replace(currentUrl.toString());
            },
            onContactSupport: () => {},
        });

        capitalOverviewComponent.mount('.capital-overview-with-offer-component-container');
    })
    .catch(console.error);
