import TransactionDataActionsBar from '../TransactionDataActionsBar';
import TransactionRefundAmount from './TransactionRefundAmount';
import TransactionRefundNotice from './TransactionRefundNotice';
import TransactionRefundReason from './TransactionRefundReason';
import TransactionRefundReference from './TransactionRefundReference';
import { TX_DATA_CLASS } from '../../constants';

const TransactionRefundView = () => {
    return (
        <div className={TX_DATA_CLASS}>
            <TransactionRefundNotice />
            <TransactionRefundAmount />
            <TransactionRefundReason />
            <TransactionRefundReference />
            <TransactionDataActionsBar />
        </div>
    );
};

export default TransactionRefundView;
