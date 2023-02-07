import { getBalanceAccountById } from '../../utils/services';
import { AdyenFP, BalanceAccount } from '@pabloai/adyen-fp';
import '@pabloai/adyen-fp/dist/adyen-fp.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';
import { getSearchParameters } from '../../utils/utils';

(async () => {
    try {
        const DEFAULT_BALANCE_ACCOUNT = 'BA3227C223222B5CWF3T45SWD';
        const { id } = getSearchParameters();
        const balanceAccount = await getBalanceAccountById(id || DEFAULT_BALANCE_ACCOUNT);
        const adyenFP = await AdyenFP({ locale: 'en-US' });

        window.balanceAccountComponent = adyenFP
            .create(BalanceAccount, {
                balanceAccount,
            })
            .mount('.balance-account-component-container');
    } catch (e) {
        console.error(e);
    }
})();
