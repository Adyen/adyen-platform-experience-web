import { AdyenFP, TransactionsDetailsComponent } from '@adyen/adyen-fp-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({
            locale: 'en-US',
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        const transactionsDetailsComponent = new TransactionsDetailsComponent({
            core: adyenFP,
            transactionId: id ?? DEFAULT_TRANSACTION_ID,
            title: 'transactionDetails',
        });

        transactionsDetailsComponent.mount('.transaction-details-component-container');
    })
    .catch(console.error);
