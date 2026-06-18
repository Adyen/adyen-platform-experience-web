import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, all_locales, CapitalOverview } from '@adyen/adyen-platform-experience-web';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

enableServerInMockedMode(true)
    .then(async () => {
        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        const capitalOverviewComponent = new CapitalOverview({
            core,
        });

        capitalOverviewComponent.mount('.capital-overview-component-container');
    })
    .catch(console.error);
