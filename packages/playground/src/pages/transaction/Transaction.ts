import { AdyenFP } from '@adyen/adyen-fp-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_TRANSACTION_ID = getDefaultID('1VVF0D5V3709DX6D');

try {
    await enableServerInMockedMode();

    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });

    adyenFP.create('transactionDetails', { transactionId: id ?? DEFAULT_TRANSACTION_ID }).mount('.transaction-details-component-container');
} catch (e) {
    console.error(e);
}
