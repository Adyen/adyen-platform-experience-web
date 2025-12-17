import { memo } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { TransactionTotalItem } from '../TransactionTotalItem/TransactionTotalItem';
import { ITransactionTotalWithKey, TotalsCardProps } from './types';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import { uniqueId } from '../../../../../utils';

export const TotalsCard = memo(({ totals, isLoading, hiddenField, fullWidth, ...ariaAttributes }: TotalsCardProps) => {
    const { i18n } = useCoreContext();
    const [maxWidths, setMaxWidths] = useMaxWidthsState();
    const [isHovered, setIsHovered] = useState(false);

    const localizedPlainCurrencyText = useMemo(() => i18n.get('transactions.overview.totals.currency.label'), [i18n]);

    const [firstTotal, ...restOfTotals] = useMemo(() => {
        return totals.map((t: ITransactionTotalWithKey) => {
            t['key'] = t.currency;
            t['expensesElemId'] = uniqueId('elem');
            t['incomingsElemId'] = uniqueId('elem');
            return t as Required<ITransactionTotalWithKey>;
        });
    }, [totals]);

    const totalsListLabel = useMemo(() => {
        switch (hiddenField) {
            case 'expenses':
                return i18n.get('transactions.overview.totals.lists.incoming');
            case 'incomings':
                return i18n.get('transactions.overview.totals.lists.outgoing');
            default:
                return i18n.get('transactions.overview.totals.lists.default');
        }
    }, [i18n, hiddenField]);

    const renderFirstTotal = useMemo(
        () => (
            <div
                role="listitem"
                aria-label={firstTotal ? `${localizedPlainCurrencyText}: ${firstTotal.currency}` : undefined}
                aria-describedby={firstTotal ? `${firstTotal.incomingsElemId} ${firstTotal.expensesElemId}` : undefined}
            >
                <TransactionTotalItem
                    showLabelUnderline={isHovered}
                    total={firstTotal}
                    hiddenField={hiddenField}
                    widths={maxWidths}
                    isHeader
                    isSkeleton={isLoading}
                    isLoading={isLoading}
                    onWidthsSet={setMaxWidths}
                    expensesElemId={firstTotal?.expensesElemId}
                    incomingsElemId={firstTotal?.incomingsElemId}
                />
            </div>
        ),
        [isHovered, firstTotal, hiddenField, maxWidths, isLoading, setMaxWidths, localizedPlainCurrencyText]
    );

    const renderRestOfTotals = useMemo(() => {
        return !isLoading && restOfTotals.length ? (
            <>
                {restOfTotals.map(total => (
                    <div
                        role="listitem"
                        key={total.key}
                        aria-label={`${localizedPlainCurrencyText}: ${total.currency}`}
                        aria-describedby={`${total.incomingsElemId} ${total.expensesElemId}`}
                    >
                        <TransactionTotalItem
                            showLabelUnderline={isHovered}
                            total={total}
                            hiddenField={hiddenField}
                            widths={maxWidths}
                            onWidthsSet={setMaxWidths}
                            expensesElemId={total.expensesElemId}
                            incomingsElemId={total.incomingsElemId}
                        />
                    </div>
                ))}
            </>
        ) : undefined;
    }, [isLoading, restOfTotals, isHovered, hiddenField, maxWidths, setMaxWidths, localizedPlainCurrencyText]);

    return (
        <ExpandableCard
            renderContent={({ collapsibleContent }) => (
                <div role="list" aria-label={totalsListLabel}>
                    {renderFirstTotal}
                    {collapsibleContent}
                </div>
            )}
            fullWidth={fullWidth}
            onMouseEnter={() => setIsHovered(true)}
            onFocus={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onBlur={() => setIsHovered(false)}
            {...ariaAttributes}
        >
            {renderRestOfTotals}
        </ExpandableCard>
    );
});
