import useTransactionDataContext from '../context';
import TransactionDataSkeleton from './TransactionDataSkeleton';
import TransactionDataView from './TransactionDataView';
import TransactionRefundView from './TransactionRefundView';

const TransactionDataContainer = () => {
    const { dataViewActive, isLoading } = useTransactionDataContext();
    return isLoading ? <TransactionDataSkeleton skeletonRowNumber={6} /> : dataViewActive ? <TransactionDataView /> : <TransactionRefundView />;
};

export default TransactionDataContainer;
