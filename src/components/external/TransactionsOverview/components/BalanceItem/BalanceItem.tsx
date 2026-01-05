import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useMemo, useRef } from 'preact/hooks';
import { BalanceItemProps } from './types';
import { SummaryItemColumnConfig } from '../SummaryItem/types';
import { SummaryItem } from '../SummaryItem/SummaryItem';

export const BalanceItem = ({
    balance,
    hiddenField,
    isHeader = false,
    showLabelUnderline = false,
    isSkeleton = false,
    isLoading = false,
    widths,
    onWidthsSet,
    availableBalanceElemId,
    reservedBalanceElemId,
}: BalanceItemProps) => {
    const { i18n } = useCoreContext();
    const availableAmountRef = useRef<HTMLDivElement>(null);
    const reservedAmountRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);

    const columnConfigs: SummaryItemColumnConfig[] = useMemo(() => {
        const availableBalanceConfig: SummaryItemColumnConfig = {
            elemId: availableBalanceElemId,
            labelKey: 'transactions.overview.balances.tags.available',
            ref: availableAmountRef,
            skeletonWidth: 80,
            getValue: () => balance && i18n.amount(balance.value, balance.currency),
            get ariaLabel(): string {
                return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
            },
        };

        const reservedBalanceConfig: SummaryItemColumnConfig = {
            elemId: reservedBalanceElemId,
            labelKey: 'transactions.overview.balances.tags.reserved',
            ref: reservedAmountRef,
            skeletonWidth: 80,
            getValue: () => balance && i18n.amount(balance.reservedValue, balance.currency),
            tooltipLabel: 'transactions.overview.balances.tags.reserved.description',
            get ariaLabel(): string {
                return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
            },
        };

        return [
            ...(hiddenField !== 'available' ? [availableBalanceConfig] : []),
            ...(hiddenField !== 'reserved' ? [reservedBalanceConfig] : []),
            {
                ref: currencyRef,
                skeletonWidth: 40,
                valueHasLabelStyle: true,
                getValue: () => balance?.currency,
            },
        ];
    }, [balance, hiddenField, i18n]);

    return (
        <SummaryItem
            showLabelUnderline={showLabelUnderline}
            isEmpty={!balance}
            columnConfigs={columnConfigs}
            isHeader={isHeader}
            isSkeletonVisible={isSkeleton}
            isLoading={isLoading}
            widths={widths}
            onWidthsSet={onWidthsSet}
        />
    );
};
