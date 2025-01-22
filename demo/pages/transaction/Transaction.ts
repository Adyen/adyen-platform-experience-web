import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, TransactionDetails, all_locales } from '../../../src';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_TRANSACTION_ID = 'EVJN42944223223N5LX43T4BGS52CQEUR';

const { id } = Object.fromEntries(new URLSearchParams(DEFAULT_TRANSACTION_ID).entries());

enableServerInMockedMode().then(async () => {
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
});
