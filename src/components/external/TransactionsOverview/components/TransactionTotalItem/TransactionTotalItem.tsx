import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useMemo, useRef } from 'preact/hooks';
import { TransactionTotalItemProps } from './types';
import { SummaryItemColumnConfig } from '../SummaryItem/types';
import { SummaryItem } from '../SummaryItem/SummaryItem';

export const TransactionTotalItem = ({
    total,
    hiddenField,
    isHeader = false,
    showLabelUnderline = false,
    isSkeleton = false,
    isLoading = false,
    widths,
    onWidthsSet,
    expensesElemId,
    incomingsElemId,
}: TransactionTotalItemProps) => {
    const { i18n } = useCoreContext();
    const incomingRef = useRef<HTMLDivElement>(null);
    const expenseRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);

    const columnConfigs: SummaryItemColumnConfig[] = useMemo(() => {
        const incomingsConfig: SummaryItemColumnConfig = {
            elemId: incomingsElemId,
            labelKey: 'transactions.overview.totals.tags.incoming',
            ref: incomingRef,
            skeletonWidth: 80,
            getValue: () => total && i18n.amount(total.incomings, total.currency),
            tooltipLabel: 'transactions.overview.totals.tags.incoming.description',
            get ariaLabel(): string {
                return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
            },
        };

        const expensesConfig: SummaryItemColumnConfig = {
            elemId: expensesElemId,
            labelKey: 'transactions.overview.totals.tags.outgoing',
            ref: expenseRef,
            skeletonWidth: 80,
            getValue: () => total && i18n.amount(total.expenses, total.currency),
            tooltipLabel: 'transactions.overview.totals.tags.outgoing.description',
            get ariaLabel(): string {
                return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
            },
        };

        return [
            ...(hiddenField !== 'incomings' ? [incomingsConfig] : []),
            ...(hiddenField !== 'expenses' ? [expensesConfig] : []),
            {
                ref: currencyRef,
                skeletonWidth: 40,
                valueHasLabelStyle: true,
                getValue: () => total?.currency,
            },
        ];
    }, [incomingsElemId, expensesElemId, hiddenField, total, i18n]);

    return (
        <SummaryItem
            showLabelUnderline={showLabelUnderline}
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
