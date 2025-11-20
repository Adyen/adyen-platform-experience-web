import { memo } from 'preact/compat';
import { BASE_CLASS } from './constants';
import { uniqueId } from '../../../../../utils';
import { useMemo } from 'preact/hooks';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { BalancesProps, IBalanceWithKey } from './types';

export const Balances = memo(({ balanceAccount, balances: balancesList, balancesEmpty, loadingBalances }: BalancesProps) => {
    const { i18n } = useCoreContext();
    const [maxWidths, setMaxWidths] = useMaxWidthsState();
    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);

    const defaultCurrencyCode = balanceAccount?.defaultCurrencyCode;
    const balancesAriaLabel = useMemo(() => i18n.get('transactions.overview.balances.labels.default'), [i18n]);
    const localizedPlainCurrencyText = useMemo(() => i18n.get('transactions.overview.balances.currency.label'), [i18n]);

    const balances = useMemo(() => {
        return [...balancesList].sort(({ currency: firstCurrency }, { currency: secondCurrency }) => {
            if (defaultCurrencyCode) {
                if (firstCurrency === defaultCurrencyCode) return -1;
                if (secondCurrency === defaultCurrencyCode) return 1;
            }
            return firstCurrency.localeCompare(secondCurrency);
        });
    }, [balancesList, defaultCurrencyCode]);

    const [firstBalance, ...restOfBalances] = useMemo(() => {
        return (
            balances?.map((t: Partial<IBalanceWithKey>) => {
                t['key'] = `${t.currency}-${Math.random()}`;
                t['balanceElemId'] = uniqueId('elem');
                return t as IBalanceWithKey;
            }) ?? []
        );
    }, [balances]);

    const renderFirstBalance = useMemo(
        () => (
            <div
                role="listitem"
                aria-label={firstBalance ? `${localizedPlainCurrencyText}: ${firstBalance.currency}` : undefined}
                aria-describedby={firstBalance ? `${firstBalance.balanceElemId}` : undefined}
            >
                <BalanceItem
                    isEmpty={balancesEmpty}
                    balance={firstBalance}
                    widths={maxWidths}
                    isHeader
                    isSkeleton={loadingBalances}
                    isLoading={loadingBalances}
                    onWidthsSet={setMaxWidths}
                    balanceElemId={firstBalance?.balanceElemId}
                />
            </div>
        ),
        [balancesEmpty, firstBalance, maxWidths, loadingBalances, setMaxWidths, localizedPlainCurrencyText]
    );

    const renderRestOfBalances = useMemo(() => {
        return !loadingBalances && restOfBalances.length ? (
            <>
                {restOfBalances.map(balance => (
                    <div
                        role="listitem"
                        key={balance.key}
                        aria-label={`${localizedPlainCurrencyText}: ${balance.currency}`}
                        aria-describedby={`${balance.balanceElemId}`}
                    >
                        <BalanceItem balance={balance} widths={maxWidths} onWidthsSet={setMaxWidths} balanceElemId={balance.balanceElemId} />
                    </div>
                ))}
            </>
        ) : undefined;
    }, [loadingBalances, restOfBalances, maxWidths, setMaxWidths, localizedPlainCurrencyText]);

    return (
        <div className={BASE_CLASS}>
            <ExpandableCard
                aria-label={balancesAriaLabel}
                fullWidth={isNarrowContainer}
                renderContent={({ collapsibleContent }) => (
                    <div role="list" aria-label={i18n.get('transactions.overview.balances.lists.default')}>
                        {renderFirstBalance}
                        {collapsibleContent}
                    </div>
                )}
                filled
            >
                {renderRestOfBalances}
            </ExpandableCard>
        </div>
    );
});
