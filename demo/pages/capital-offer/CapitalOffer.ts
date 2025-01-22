import { AdyenPlatformExperience, all_locales, CapitalOffer } from '@adyen/adyen-platform-experience-web';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';

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
