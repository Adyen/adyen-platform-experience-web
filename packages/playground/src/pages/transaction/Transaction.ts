import { AdyenPlatformExperience, all_locales, TransactionDetails } from '@adyen/adyen-platform-experience-web';
import sessionRequest from '../../utils/sessionRequest';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { getDefaultID, getSearchParameters } from '../../utils/utils';

const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();

        const core = await AdyenPlatformExperience({
            environment: 'test',
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        createLanguageButtons({ core });

        const transactionDetailsComponent = new TransactionDetails({
            core,
            id: id ?? DEFAULT_TRANSACTION_ID,
            onContactSupport: () => {},
        });

        transactionDetailsComponent.mount('.transaction-details-component-container');
    })
    .catch(console.error);
