import useCoreContext from '@src/core/Context/useCoreContext';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { useRef } from 'preact/hooks';
import { BalanceItemProps } from '@src/components/external/Transactions/components/BalanceItem/types';
import { SummaryItemColumnConfig } from '@src/components/external/Transactions/components/SummaryItem/types';
import { SummaryItem } from '@src/components/external/Transactions/components/SummaryItem/SummaryItem';

export const BalanceItem = ({ balance, isHeader = false, isSkeleton = false, isLoading = false, widths, onWidthsSet }: BalanceItemProps) => {
    const { i18n } = useCoreContext();
    const isSkeletonVisible = isSkeleton || !balance;
    const amountRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const columnConfigs: SummaryItemColumnConfig[] = [
        {
            labelKey: 'accountBalance',
            ref: amountRef,
            skeletonWidth: 80,
            valueTypographyVariant: TypographyVariant.TITLE,
            getValue: () => balance && i18n.amount(balance.value, balance.currency),
        },
        {
            ref: currencyRef,
            skeletonWidth: 40,
            valueTypographyVariant: TypographyVariant.CAPTION,
            getValue: () => balance?.currency,
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
