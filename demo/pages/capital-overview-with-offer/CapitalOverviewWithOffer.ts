import { AdyenPlatformExperience, all_locales, CapitalOverview } from '@adyen/adyen-platform-experience-web';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest({ accountHolderId: process.env.SESSION_ACCOUNT_HOLDER_WITH_OFFER });
    },
});

const capitalOverviewComponent = new CapitalOverview({
    core,
    onFundsRequest: () => {},
    onContactSupport: () => {},
});

capitalOverviewComponent.mount('.capital-overview-with-offer-component-container');
