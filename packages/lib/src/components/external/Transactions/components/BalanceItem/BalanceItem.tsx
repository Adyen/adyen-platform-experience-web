import useCoreContext from '@src/core/Context/useCoreContext';
import { useRef } from 'preact/hooks';
import { BalanceItemProps } from '@src/components/external/Transactions/components/BalanceItem/types';
import { SummaryItemColumnConfig } from '@src/components/external/Transactions/components/SummaryItem/types';
import { SummaryItem } from '@src/components/external/Transactions/components/SummaryItem/SummaryItem';

export const BalanceItem = ({ balance, isHeader = false, isSkeleton = false, isLoading = false, widths, onWidthsSet, isEmpty }: BalanceItemProps) => {
    const { i18n } = useCoreContext();
    const amountRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const columnConfigs: SummaryItemColumnConfig[] = [
        {
            labelKey: 'accountBalance',
            ref: amountRef,
            skeletonWidth: 80,
            getValue: () => balance && i18n.amount(balance.value, balance.currency),
        },
        {
            ref: currencyRef,
            skeletonWidth: 40,
            valueHasLabelStyle: true,
            getValue: () => balance?.currency,
        },
    ];

    return (
        <SummaryItem
            isEmpty={isEmpty}
            columnConfigs={columnConfigs}
            isHeader={isHeader}
            isSkeletonVisible={isSkeleton}
            isLoading={isLoading}
            widths={widths}
            onWidthsSet={onWidthsSet}
        />
    );
};
