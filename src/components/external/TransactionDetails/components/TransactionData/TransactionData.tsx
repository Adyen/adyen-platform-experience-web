import { useEffect } from 'preact/hooks';
import { boolOrFalse } from '../../../../../utils';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import TransactionDataContent from './TransactionDataContent';
import type { TransactionDataProps } from '../../types';

export const TransactionData = ({ error, forceHideTitle, isFetching, transaction }: TransactionDataProps) => {
    const isLoading = boolOrFalse(isFetching);
    const isWithoutContent = !(transaction || error);
    const showLoadingIndicator = isLoading || isWithoutContent;

    useEffect(() => {
        // ensure title is hidden while loading or when transaction data is missing
        if (showLoadingIndicator || !transaction) forceHideTitle?.(true);
    }, [forceHideTitle, showLoadingIndicator, transaction]);

    if (showLoadingIndicator) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    if (transaction) {
        return <TransactionDataContent forceHideTitle={forceHideTitle} transaction={transaction} />;
    }

    return null;
};
