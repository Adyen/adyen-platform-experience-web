import TransactionDataAmount from './TransactionDataAmount';
import TransactionDataDate from './TransactionDataDate';
import TransactionDataPaymentMethod from './TransactionDataPaymentMethod';
import TransactionDataProperties from './TransactionDataProperties';
import TransactionDataTags from './TransactionDataTags';
import { TX_DATA_CONTAINER } from '../../constants';

const TransactionDataView = () => (
    <>
        <div className={TX_DATA_CONTAINER}>
            <TransactionDataTags />
            <TransactionDataAmount />
            <TransactionDataPaymentMethod />
            <TransactionDataDate />
        </div>

        <TransactionDataProperties />
    </>
);

export default TransactionDataView;
