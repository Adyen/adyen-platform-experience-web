import { AdyenPlatformExperience, TransactionDetails, all_locales } from '../../../src';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../../mocks/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { getDefaultID, getSearchParameters, TEST_CONFIG } from '../../utils/utils';

const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();

        const core = await AdyenPlatformExperience({
            availableTranslations: [all_locales],
            environment: 'test',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        createLanguageButtons({ core });

        const transactionDetailsComponent = new TransactionDetails({
            core,
            id: id ?? DEFAULT_TRANSACTION_ID,
            onContactSupport: () => {},
            ...TEST_CONFIG,
        });

        transactionDetailsComponent.mount('.transaction-details-component-container');
    })
    .catch(console.error);
