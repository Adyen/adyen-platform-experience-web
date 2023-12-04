import { AdyenFP, TransactionsDetailsComponent } from '@adyen/adyen-fp-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });

        const transactionsDetailsComponent = new TransactionsDetailsComponent({ core: adyenFP, transactionId: id ?? DEFAULT_TRANSACTION_ID });

        transactionsDetailsComponent.mount('.transaction-details-component-container');
    })
    .catch(console.error);
