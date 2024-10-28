import { boolOrFalse } from '../../../../../utils';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import TransactionDataContent from './TransactionDataContent';
import type { TransactionDataProps } from '../../types';

export const TransactionData = ({ error, forceHideTitle, isFetching, transaction }: TransactionDataProps) => {
    const isLoading = boolOrFalse(isFetching);
    const isWithoutContent = !(transaction || error);

    if (isLoading || isWithoutContent) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    if (transaction) {
        return <TransactionDataContent forceHideTitle={forceHideTitle} transaction={transaction} />;
    }

    return null;
};
