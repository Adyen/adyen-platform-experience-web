import { boolOrFalse } from '../../../../../utils';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import TransactionDataContent from './TransactionDataContent';
import type { TransactionDataProps } from '../../types';

export const TransactionData = ({ error, isFetching, transaction, extraFields }: TransactionDataProps) => {
    const isLoading = boolOrFalse(isFetching);
    const isWithoutContent = !(transaction || error);
    const showLoadingIndicator = isLoading || isWithoutContent;

    if (showLoadingIndicator) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    if (transaction) {
        return <TransactionDataContent transaction={transaction} extraFields={extraFields} />;
    }

    return null;
};
