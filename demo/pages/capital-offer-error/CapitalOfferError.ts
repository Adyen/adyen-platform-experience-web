import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, all_locales, CapitalOffer } from '../../../src';
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

        const capitalOfferComponentError = new CapitalOffer({
            core,
            onFundsRequest: () => {},
            onContactSupport: () => {
                window.open('https://www.adyen.com/', '_blank');
            },
        });

        capitalOfferComponentError.mount('.capital-offer-component-error-container');
    })
    .catch(console.error);
