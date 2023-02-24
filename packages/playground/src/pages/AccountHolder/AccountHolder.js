import { getAccountHolderById } from '../../utils/services';
import { AdyenFP, accountHolder } from '@pabloai/adyen-fp';
import '@pabloai/adyen-fp/dist/adyen-fp.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';
import { getSearchParameters } from '../../utils/utils';

const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';

(async () => {
    try {
        const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({ locale: 'en-US' });
        const data = await getAccountHolderById(id || DEFAULT_ACCOUNT_HOLDER);

        adyenFP
            .create(accountHolder, { accountHolder: data })
            .mount('.account-holder-component-container');
    } catch (e) {
        console.error(e);
    }
})();
