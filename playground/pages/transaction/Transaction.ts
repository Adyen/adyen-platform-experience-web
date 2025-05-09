import { AdyenPlatformExperience, TransactionDetails, all_locales } from '../../../src';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { getDefaultID, getSearchParameters } from '../../utils/utils';

const DEFAULT_TRANSACTION_ID = getDefaultID('B78I76Y77072H126');

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
            id: (id || DEFAULT_TRANSACTION_ID) as string,
            onContactSupport: () => {},
        });

        transactionDetailsComponent.mount('.transaction-details-component-container');
    })
    .catch(console.error);
