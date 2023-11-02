import { AdyenFP } from '@adyen/adyen-fp-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_BALANCE_ACCOUNT = getDefaultID('BA3227C223222B5CWF3T45SWD');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });

        adyenFP.create('balanceAccount', { balanceAccountId: id ?? DEFAULT_BALANCE_ACCOUNT }).mount('.balance-account-component-container');
    })
    .catch(console.error);
