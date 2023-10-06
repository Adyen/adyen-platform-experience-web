import { AdyenFP } from '@adyen/adyen-fp-web';
import { getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

try {
    await enableServerInMockedMode();

    const DEFAULT_TRANSACTION_ID = '1VVF0D5V3709DX6D';
    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });

    adyenFP.create('transactionDetails', { transactionId: DEFAULT_TRANSACTION_ID }).mount('.transaction-details-component-container');
} catch (e) {
    console.error(e);
}
