import TransactionDataView from './TransactionDataView';
import type { TransactionDetailData } from '../types';

export const TransactionDataContainer = ({ transaction }: { transaction: TransactionDetailData }) => {
    return <TransactionDataView transaction={transaction} />;
};

export default TransactionDataContainer;
