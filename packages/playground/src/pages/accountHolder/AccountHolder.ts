import { getAccountHolderById } from '../../utils/services';
import { AdyenFP, AccountHolderComponent } from '@adyen/adyen-fp-web';
import { getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';

try {
    await enableServerInMockedMode();

    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US' });
    const data = await getAccountHolderById(id || DEFAULT_ACCOUNT_HOLDER);
    adyenFP.create(AccountHolderComponent, { accountHolder: data }).mount('.account-holder-component-container');
} catch (e) {
    console.error(e);
}
