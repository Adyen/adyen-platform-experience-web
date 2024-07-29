import TransactionDataContainer from './TransactionDataContainer';
import TransactionDataSkeleton from './TransactionDataSkeleton';
import type { TransactionDetailData } from '../types';

export const TransactionData = ({ transaction, isFetching }: { transaction: TransactionDetailData; isFetching?: boolean }) =>
    transaction ? <TransactionDataContainer transaction={transaction} /> : <TransactionDataSkeleton isLoading={isFetching} skeletonRowNumber={6} />;
