import { memo } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { IBalanceWithKey, BalancesCardProps } from './types';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import { uniqueId } from '../../../../../utils';

export const BalancesCard = memo(({ balances, isLoading, hiddenField, fullWidth, ...ariaAttributes }: BalancesCardProps) => {
    const { i18n } = useCoreContext();
    const [maxWidths, setMaxWidths] = useMaxWidthsState();
    const [isHovered, setIsHovered] = useState(false);

    const localizedPlainCurrencyText = useMemo(() => i18n.get('transactions.overview.balances.currency.label'), [i18n]);

    const [firstBalance, ...restOfBalances] = useMemo<Required<IBalanceWithKey>[]>(() => {
        return balances.map((t: IBalanceWithKey) => ({
            ...t,
            key: t.currency,
            availableBalanceElemId: uniqueId('elem'),
            reservedBalanceElemId: uniqueId('elem'),
        }));
    }, [balances]);

    const balancesListLabel = useMemo(() => {
        switch (hiddenField) {
            case 'available':
                return i18n.get('transactions.overview.balances.lists.reserved');
            case 'reserved':
                return i18n.get('transactions.overview.balances.lists.available');
            default:
                return i18n.get('transactions.overview.balances.lists.default');
        }
    }, [i18n, hiddenField]);

    const renderFirstBalance = useMemo(
        () => (
            <div
                role="listitem"
                aria-label={firstBalance ? `${localizedPlainCurrencyText}: ${firstBalance.currency}` : undefined}
                aria-describedby={firstBalance ? `${firstBalance.availableBalanceElemId} ${firstBalance.reservedBalanceElemId}` : undefined}
            >
                <BalanceItem
                    showLabelUnderline={isHovered}
                    balance={firstBalance}
                    hiddenField={hiddenField}
                    widths={maxWidths}
                    isHeader
                    isSkeleton={isLoading}
                    isLoading={isLoading}
                    onWidthsSet={setMaxWidths}
                    reservedBalanceElemId={firstBalance?.reservedBalanceElemId}
                    availableBalanceElemId={firstBalance?.availableBalanceElemId}
                />
            </div>
        ),
        [isHovered, firstBalance, hiddenField, maxWidths, isLoading, setMaxWidths, localizedPlainCurrencyText]
    );

    const renderRestOfBalances = useMemo(() => {
        return !isLoading && restOfBalances.length ? (
            <>
                {restOfBalances.map(total => (
                    <div
                        role="listitem"
                        key={total.key}
                        aria-label={`${localizedPlainCurrencyText}: ${total.currency}`}
                        aria-describedby={`${total.availableBalanceElemId} ${total.reservedBalanceElemId}`}
                    >
                        <BalanceItem
                            showLabelUnderline={isHovered}
                            balance={total}
                            hiddenField={hiddenField}
                            widths={maxWidths}
                            onWidthsSet={setMaxWidths}
                            reservedBalanceElemId={total.reservedBalanceElemId}
                            availableBalanceElemId={total.availableBalanceElemId}
                        />
                    </div>
                ))}
            </>
        ) : undefined;
    }, [isLoading, restOfBalances, isHovered, hiddenField, maxWidths, setMaxWidths, localizedPlainCurrencyText]);

    return (
        <ExpandableCard
            renderContent={({ collapsibleContent }) => (
                <div role="list" aria-label={balancesListLabel}>
                    {renderFirstBalance}
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
            {renderRestOfBalances}
        </ExpandableCard>
    );
});
