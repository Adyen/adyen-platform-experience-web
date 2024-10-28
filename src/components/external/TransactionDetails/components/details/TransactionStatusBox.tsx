import TransactionTags from './TransactionTags';
import TransactionAmount from './TransactionAmount';
import TransactionPaymentMethod from './TransactionPaymentMethod';
import TransactionDate from './TransactionDate';

const TransactionStatusBox = () => {
    return (
        <div>
            <TransactionTags />
            <TransactionAmount />
            <TransactionPaymentMethod />
            <TransactionDate />
        </div>
    );
};

export default TransactionStatusBox;
