import { getAccountHolders } from '../../utils/services';
import { AdyenFP, accountHolders } from '@adyen/adyen-fp-web';
import '@adyen/adyen-fp-web/dist/adyen-fp-web.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';

(async () => {
    try {
        const adyenFP = await AdyenFP();
        const data = await getAccountHolders();

        console.log(data);

        adyenFP
            .create(accountHolders, {
                accountHolders: data,
                onAccountHolderSelected: ({ id }) => {
                    window.location.assign(`/accountholder?id=${id}`);
                }
            })
            .mount('.account-holders-component-container');
    } catch (e) {
        console.error(e);
    }
})();
