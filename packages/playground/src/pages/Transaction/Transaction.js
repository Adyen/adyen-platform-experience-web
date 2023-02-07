import { getTransactionById } from '../../utils/services';
import { AdyenFP, TransactionDetails } from '@pabloai/adyen-fp';
import { getSearchParameters } from '../../utils/utils';
import '@pabloai/adyen-fp/dist/adyen-fp.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';

(async () => {
    try {
        const DEFAULT_TRANSACTION_ID = '1VVF0D5V3709DX6D';
        const { id } = getSearchParameters();
        const transaction = await getTransactionById(id || DEFAULT_TRANSACTION_ID);
        const adyenFP = await AdyenFP({ locale: 'en-US' });

        adyenFP
            .create(TransactionDetails, {
                transaction,
            })
            .mount('.transaction-details-component-container');
    } catch (e) {
        console.error(e);
    }
})();
