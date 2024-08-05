import TransactionRefundAmount from './TransactionRefundAmount';
import TransactionRefundNotice from './TransactionRefundNotice';
import TransactionRefundReason from './TransactionRefundReason';
import TransactionRefundReference from './TransactionRefundReference';

const TransactionRefundView = () => (
    <>
        <TransactionRefundNotice />
        <TransactionRefundAmount />
        <TransactionRefundReason />
        <TransactionRefundReference />
    </>
);

export default TransactionRefundView;
