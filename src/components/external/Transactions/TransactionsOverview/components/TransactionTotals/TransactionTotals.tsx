import { memo } from 'preact/compat';
import { TotalsCard } from './TotalsCard';
import { BASE_CLASS, ITEM_CLASS } from './constants';
import { TransactionTotalsProps } from './types';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './TransactionTotals.scss';

const TransactionTotals = memo(({ loadingTotals, totals }: TransactionTotalsProps) => {
    const { i18n } = useCoreContext();
    const isXsContainer = useResponsiveContainer(containerQueries.only.xs);
    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);

    return (
        <div className={BASE_CLASS}>
            {isXsContainer ? (
                <>
                    <div className={ITEM_CLASS}>
                        <TotalsCard
                            aria-label={i18n.get('transactions.overview.totals.labels.incoming')}
                            totals={totals}
                            isLoading={loadingTotals}
                            hiddenField="expenses"
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                    <div className={ITEM_CLASS}>
                        <TotalsCard
                            aria-label={i18n.get('transactions.overview.totals.labels.outgoing')}
                            totals={totals}
                            isLoading={loadingTotals}
                            hiddenField="incomings"
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                </>
            ) : (
                <TotalsCard
                    aria-label={i18n.get('transactions.overview.totals.labels.default')}
                    totals={totals}
                    isLoading={loadingTotals}
                    fullWidth={isNarrowContainer}
                />
            )}
        </div>
    );
});

export default TransactionTotals;
