import { getTransactionById } from '../../utils/services';
import { AdyenFP, transactionDetails } from '@Adyen/adyen-fp-web';
import { getSearchParameters } from '../../utils/utils';
import '@Adyen/adyen-fp-web/dist/adyen-fp.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';

(async () => {
    try {
        const DEFAULT_TRANSACTION_ID = '1VVF0D5V3709DX6D';
        const { id } = getSearchParameters();
        const data = await getTransactionById(id || DEFAULT_TRANSACTION_ID);
        const adyenFP = await AdyenFP({ locale: 'en-US' });

        adyenFP
            .create(transactionDetails, { transaction: data })
            .mount('.transaction-details-component-container');
    } catch (e) {
        console.error(e);
    }
})();
