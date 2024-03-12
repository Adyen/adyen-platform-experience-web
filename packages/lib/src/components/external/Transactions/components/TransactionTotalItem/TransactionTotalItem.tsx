import useCoreContext from '@src/core/Context/useCoreContext';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { SummaryItemColumnConfig } from '@src/components/external/Transactions/components/SummaryItem/types';
import { TransactionTotalItemProps } from '@src/components/external/Transactions/components/TransactionTotalItem/types';
import { useRef } from 'preact/hooks';
import { SummaryItem } from '@src/components/external/Transactions/components/SummaryItem/SummaryItem';

export const TransactionTotalItem = ({
    total,
    isHeader = false,
    isSkeleton = false,
    isLoading = false,
    widths,
    onWidthsSet,
}: TransactionTotalItemProps) => {
    const { i18n } = useCoreContext();
    const isSkeletonVisible = isSkeleton || !total;
    const incomingRef = useRef<HTMLDivElement>(null);
    const expenseRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const columnConfigs: SummaryItemColumnConfig[] = [
        {
            labelKey: 'incoming',
            ref: incomingRef,
            skeletonWidth: 80,
            getValue: () => total && i18n.amount(total.incomings, total.currency),
        },
        {
            labelKey: 'expense',
            ref: expenseRef,
            skeletonWidth: 80,
            getValue: () => total && i18n.amount(total.expenses, total.currency),
        },
        {
            ref: currencyRef,
            skeletonWidth: 40,
            valueHasLabelStyle: true,
            getValue: () => total?.currency,
        },
    ];

    return (
        <SummaryItem
            columnConfigs={columnConfigs}
            isHeader={isHeader}
            isSkeletonVisible={isSkeletonVisible}
            isLoading={isLoading}
            widths={widths}
            onWidthsSet={onWidthsSet}
        />
    );
};
