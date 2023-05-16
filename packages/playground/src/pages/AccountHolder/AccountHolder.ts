import { getAccountHolderById } from '../../utils/services';
import { AdyenFP, accountHolder } from '@adyen/adyen-fp-web';
import '@adyen/adyen-fp-web/dist/adyen-fp-web.css';
import '../../utils/nav-init';
import '../../assets/style/style.scss';
import { getSearchParameters } from '../../utils/utils';

const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';

try {
    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US' });
    const data = await getAccountHolderById(id || DEFAULT_ACCOUNT_HOLDER);
    adyenFP.create(accountHolder, { accountHolder: data }).mount('.account-holder-component-container');
} catch (e) {
    console.error(e);
}
