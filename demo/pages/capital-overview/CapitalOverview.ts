import { AdyenPlatformExperience, all_locales, CapitalOverview } from '../../../src';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest();
    },
});

const capitalOfferComponent = new CapitalOverview({
    core,
});

capitalOfferComponent.mount('.capital-overview-component-container');
