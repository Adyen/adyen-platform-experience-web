import { getAccountHolderById } from '../../utils/services';
import { AccountHolder, AdyenFP } from '@pabloai/adyen-fp';
import '@pabloai/adyen-fp/dist/adyen-fp.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';
import { getSearchParameters } from '../../utils/utils';

(async () => {
    try {
        const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';
        const { id } = getSearchParameters();
        const accountHolder = await getAccountHolderById(id || DEFAULT_ACCOUNT_HOLDER);
        const adyenFP = await AdyenFP({ locale: 'en-US' });

        window.accountHolderComponent = adyenFP
            .create(AccountHolder, {
                accountHolder,
            })
            .mount('.account-holder-component-container');
    } catch (e) {
        console.error(e);
    }
})();
