import TransactionDataActionsBar from '../TransactionDataActionsBar';
import { TX_DATA_CLASS } from '../../constants';

const TransactionRefundView = () => {
    return (
        <div className={TX_DATA_CLASS}>
            <TransactionDataActionsBar />
        </div>
    );
};

export default TransactionRefundView;
