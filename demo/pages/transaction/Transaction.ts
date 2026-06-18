import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, TransactionDetails, all_locales } from '@adyen/adyen-platform-experience-web';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_TRANSACTION_ID = 'SRZ2J8AND6K2W3YF';

const { id } = Object.fromEntries(new URLSearchParams(DEFAULT_TRANSACTION_ID).entries());

enableServerInMockedMode(true)
    .then(async () => {
        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        const transactionDetailsComponent = new TransactionDetails({
            core,
            id: (id || DEFAULT_TRANSACTION_ID) as string,
            onContactSupport: () => {},
        });

        transactionDetailsComponent.mount('.transaction-details-component-container');
    })
    .catch(console.error);
