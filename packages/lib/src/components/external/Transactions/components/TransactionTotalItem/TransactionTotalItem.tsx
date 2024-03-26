import { TransactionTotalItemProps } from '@src/components/external/Transactions/components/TransactionTotalItem/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { useMemo, useRef } from 'preact/hooks';
import { SummaryItemColumnConfig } from '@src/components/external/Transactions/components/SummaryItem/types';
import { SummaryItem } from '@src/components/external/Transactions/components/SummaryItem/SummaryItem';

export const TransactionTotalItem = ({
    total,
    isHeader = false,
    isHovered = false,
    isSkeleton = false,
    isLoading = false,
    widths,
    onWidthsSet,
}: TransactionTotalItemProps) => {
    const { i18n } = useCoreContext();
    const incomingRef = useRef<HTMLDivElement>(null);
    const expenseRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);

    const columnConfigs: SummaryItemColumnConfig[] = useMemo(
        () => [
            {
                labelKey: 'totalIncoming',
                ref: incomingRef,
                skeletonWidth: 80,
                getValue: () => total && i18n.amount(total.incomings, total.currency),
                tooltipLabel: 'tooltip.totalIncoming',
            },
            {
                labelKey: 'totalOutgoing',
                ref: expenseRef,
                skeletonWidth: 80,
                getValue: () => total && i18n.amount(total.expenses, total.currency),
                tooltipLabel: 'tooltip.totalOutgoing',
            },
            {
                ref: currencyRef,
                skeletonWidth: 40,
                valueHasLabelStyle: true,
                getValue: () => total?.currency,
            },
        ],
        [total, i18n]
    );

    return (
        <SummaryItem
            isHovered={isHovered}
            isEmpty={!total}
            columnConfigs={columnConfigs}
            isHeader={isHeader}
            isSkeletonVisible={isSkeleton}
            isLoading={isLoading}
            widths={widths}
            onWidthsSet={onWidthsSet}
        />
    );
};
