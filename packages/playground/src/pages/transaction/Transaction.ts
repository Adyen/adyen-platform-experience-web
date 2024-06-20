import { AdyenPlatformExperience, TransactionsDetails } from '@adyen/adyen-platform-experience-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const AdyenPlatform = await AdyenPlatformExperience({
            locale: 'en-US',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        const transactionsDetailsComponent = new TransactionsDetails({
            core: AdyenPlatform,
            id: id ?? DEFAULT_TRANSACTION_ID,
            title: 'transactionDetails',
            onContactSupport: () => {},
        });

        transactionsDetailsComponent.mount('.component-element');
    })
    .catch(console.error);
