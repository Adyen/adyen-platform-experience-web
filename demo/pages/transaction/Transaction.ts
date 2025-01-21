import { AdyenPlatformExperience, TransactionDetails, all_locales } from '@adyen/adyen-platform-experience-web';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_TRANSACTION_ID = 'EVJN42944223223N5LX43T4BGS52CQEUR';

const { id } = Object.fromEntries(new URLSearchParams(DEFAULT_TRANSACTION_ID).entries());

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
