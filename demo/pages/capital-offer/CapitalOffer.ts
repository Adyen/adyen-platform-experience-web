import { AdyenPlatformExperience, all_locales, CapitalOffer } from '../../../src';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest();
    },
});

const capitalOfferComponentError = new CapitalOffer({
    core,
    onFundsRequest: () => {},
    onContactSupport: () => {
        window.open('https://www.google.com', '_blank');
    },
});

capitalOfferComponentError.mount('.capital-component-container');
