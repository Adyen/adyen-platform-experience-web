import { AdyenPlatformExperience, PayoutDetails } from '@adyen/adyen-platform-experience-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_TRANSACTION_ID = getDefaultID('1234567890123456');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const AdyenPlatform = await AdyenPlatformExperience({
            locale: 'en-US',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        const transactionsDetailsComponent = new PayoutDetails({
            core: AdyenPlatform,
            id: id ?? DEFAULT_TRANSACTION_ID,
            title: 'payoutDetails',
            onContactSupport: () => {},
        });

        transactionsDetailsComponent.mount('.payout-details-component-container');
    })
    .catch(console.error);
