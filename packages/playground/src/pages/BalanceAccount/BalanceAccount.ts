import { getBalanceAccountById } from '../../utils/services';
import { AdyenFP, balanceAccount } from '@adyen/adyen-fp-web';
import '@adyen/adyen-fp-web/dist/adyen-fp-web.css';
import '../../utils/nav-init';
import '../../assets/style/style.scss';
import { getSearchParameters } from '../../utils/utils';

const DEFAULT_BALANCE_ACCOUNT = 'BA3227C223222B5CWF3T45SWD';

try {
    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US' });
    const data = await getBalanceAccountById(id || DEFAULT_BALANCE_ACCOUNT);

    adyenFP.create(balanceAccount, { balanceAccount: data }).mount('.balance-account-component-container');
} catch (e) {
    console.error(e);
}
