import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useMemo, useRef } from 'preact/hooks';
import { BalanceItemProps } from './types';
import { SummaryItemColumnConfig } from '../SummaryItem/types';
import { SummaryItem } from '../SummaryItem/SummaryItem';

export const BalanceItem = ({ balance, isHeader = false, isSkeleton = false, isLoading = false, widths, onWidthsSet, isEmpty }: BalanceItemProps) => {
    const { i18n } = useCoreContext();
    const amountRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const columnConfigs: SummaryItemColumnConfig[] = useMemo(
        () => [
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
        ],
        [balance, amountRef, i18n]
    );

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
