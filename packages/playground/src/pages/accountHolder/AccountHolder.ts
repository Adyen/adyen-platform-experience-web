import { AdyenFP } from '@adyen/adyen-fp-web';
import { getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';

try {
    await enableServerInMockedMode();

    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });

    adyenFP.create('accountHolder', { accountHolderId: id ?? DEFAULT_ACCOUNT_HOLDER }).mount('.account-holder-component-container');
} catch (e) {
    console.error(e);
}
