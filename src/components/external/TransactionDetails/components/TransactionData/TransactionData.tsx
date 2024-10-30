import { useEffect } from 'preact/hooks';
import { boolOrFalse } from '../../../../../utils';
import { useModalContext } from '../../../../internal/Modal/Modal';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import TransactionDataContent from './TransactionDataContent';
import type { TransactionDataProps } from '../../types';

export const TransactionData = ({ error, forceHideTitle, isFetching, transaction }: TransactionDataProps) => {
    const { withinModal } = useModalContext();
    const isLoading = boolOrFalse(isFetching);
    const isWithoutContent = !(transaction || error);
    const showLoadingIndicator = isLoading || isWithoutContent;

    useEffect(() => {
        if (showLoadingIndicator || !transaction) {
            // while loading or when transaction data is missing
            // ensure title is hidden (only within modal)
            forceHideTitle?.(withinModal);
        }
    }, [forceHideTitle, showLoadingIndicator, transaction, withinModal]);

    if (showLoadingIndicator) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    if (transaction) {
        return <TransactionDataContent forceHideTitle={forceHideTitle} transaction={transaction} />;
    }

    return null;
};
