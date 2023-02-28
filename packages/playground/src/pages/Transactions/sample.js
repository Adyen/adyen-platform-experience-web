import { getMyTransactions } from '../../utils/services';
import { AdyenFP } from '@adyen/adyen-fp-web';

const myTransactions = await getMyTransactions();
const adyenFP = await AdyenFP();

adyenFP
    .create('transactionsList', { transactions: myTransactions } )
    .mount('.transactions-component-container');

