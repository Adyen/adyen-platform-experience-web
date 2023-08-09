import { getBalanceAccountById } from '../../utils/services';
import { AdyenFP } from '@adyen/adyen-fp-web';
import { getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_BALANCE_ACCOUNT = 'BA3227C223222B5CWF3T45SWD';

try {
    await enableServerInMockedMode();

    const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US' });
    const data = await getBalanceAccountById(id || DEFAULT_BALANCE_ACCOUNT);

    adyenFP.create('balanceAccount', { balanceAccount: data }).mount('.balance-account-component-container');
} catch (e) {
    console.error(e);
}
