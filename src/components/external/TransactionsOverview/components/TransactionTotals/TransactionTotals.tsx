import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { TotalsCard } from './TotalsCard';
import { BASE_CLASS, ITEM_CLASS } from './constants';
import { IBalanceAccountBase, ITransactionTotal } from '../../../../../types';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './TransactionTotals.scss';

export interface TransactionTotalsProps {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    loadingTotals: boolean;
    totals: readonly Readonly<ITransactionTotal>[];
}

const TransactionTotals = memo(({ balanceAccount, loadingTotals, totals }: TransactionTotalsProps) => {
    const { i18n } = useCoreContext();

    const defaultCurrencyCode = balanceAccount?.defaultCurrencyCode;
    const isXsContainer = useResponsiveContainer(containerQueries.only.xs);
    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);

    const sortedTotals = useMemo(() => {
        return [...totals].sort(({ currency: firstCurrency }, { currency: secondCurrency }) => {
            if (defaultCurrencyCode) {
                if (firstCurrency === defaultCurrencyCode) return -1;
                if (secondCurrency === defaultCurrencyCode) return 1;
            }
            return firstCurrency.localeCompare(secondCurrency);
        }) as typeof totals;
    }, [defaultCurrencyCode, totals]);

    return (
        <div className={BASE_CLASS}>
            {isXsContainer ? (
                <>
                    <div className={ITEM_CLASS}>
                        <TotalsCard
                            aria-label={i18n.get('transactions.overview.totals.labels.incoming')}
                            totals={sortedTotals}
                            isLoading={loadingTotals}
                            hiddenField="expenses"
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                    <div className={ITEM_CLASS}>
                        <TotalsCard
                            aria-label={i18n.get('transactions.overview.totals.labels.outgoing')}
                            totals={sortedTotals}
                            isLoading={loadingTotals}
                            hiddenField="incomings"
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                </>
            ) : (
                <TotalsCard
                    aria-label={i18n.get('transactions.overview.totals.labels.default')}
                    totals={sortedTotals}
                    isLoading={loadingTotals}
                    fullWidth={isNarrowContainer}
                />
            )}
        </div>
    );
});

export default TransactionTotals;
