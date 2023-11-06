import { AdyenFP, AccountHolderComponent } from '@adyen/adyen-fp-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_ACCOUNT_HOLDER = getDefaultID('AH3227B2248HKJ5BHTQPKC5GX');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });

        const accountHolderComponent = new AccountHolderComponent({ core: adyenFP, accountHolderId: id ?? DEFAULT_ACCOUNT_HOLDER });

        accountHolderComponent.mount('.account-holder-component-container');
    }).catch(console.error);
