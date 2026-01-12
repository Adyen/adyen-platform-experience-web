import { memo } from 'preact/compat';
import { BalancesCard } from './BalancesCard';
import { BASE_CLASS, ITEM_CLASS } from './constants';
import { BalancesProps } from './types';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './Balances.scss';

const Balances = memo(({ balances, loadingBalances }: BalancesProps) => {
    const { i18n } = useCoreContext();
    const isXsContainer = useResponsiveContainer(containerQueries.only.xs);
    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);

    return (
        <div className={BASE_CLASS}>
            {isXsContainer ? (
                <>
                    <div className={ITEM_CLASS}>
                        <BalancesCard
                            aria-label={i18n.get('transactions.overview.balances.labels.available')}
                            balances={balances}
                            isLoading={loadingBalances}
                            hiddenField="reserved"
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                    <div className={ITEM_CLASS}>
                        <BalancesCard
                            aria-label={i18n.get('transactions.overview.balances.labels.reserved')}
                            balances={balances}
                            isLoading={loadingBalances}
                            hiddenField="available"
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                </>
            ) : (
                <BalancesCard
                    aria-label={i18n.get('transactions.overview.balances.labels.default')}
                    balances={balances}
                    isLoading={loadingBalances}
                    fullWidth={isNarrowContainer}
                />
            )}
        </div>
    );
});

export default Balances;
