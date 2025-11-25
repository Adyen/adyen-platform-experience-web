import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { OperationParameters } from '../../../../../types/api/endpoints';
import { WithPartialField } from '../../../../../utils/types';
import { BASE_CLASS, ITEM_CLASS } from './constants';
import { memo } from 'preact/compat';
import { IAmount } from '../../../../../types';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import './TransactionTotals.scss';
import { TotalsCard } from './TotalsCard';

type TransactionTotalsProps = Required<OperationParameters<'getTransactionTotals'>['query']> & {
    isAvailableCurrenciesFetching: boolean;
    availableCurrencies: IAmount['currency'][] | undefined;
    fullWidth?: boolean;
};

const TransactionTotals = memo(
    ({
        availableCurrencies,
        isAvailableCurrenciesFetching,
        balanceAccountId,
        createdSince,
        createdUntil,
        categories,
        statuses,
        maxAmount,
        minAmount,
        currencies,
        fullWidth,
    }: WithPartialField<TransactionTotalsProps, 'balanceAccountId' | 'minAmount' | 'maxAmount'>) => {
        const { i18n } = useCoreContext();
        const { getTransactionTotals } = useConfigContext().endpoints;

        const fetchCallback = useCallback(async () => {
            return getTransactionTotals?.(EMPTY_OBJECT, {
                query: {
                    createdSince,
                    createdUntil,
                    categories,
                    statuses,
                    maxAmount,
                    minAmount,
                    currencies,
                    balanceAccountId: balanceAccountId!,
                },
            });
        }, [balanceAccountId, categories, createdSince, createdUntil, currencies, getTransactionTotals, maxAmount, minAmount, statuses]);

        const { data, isFetching } = useFetch({
            fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId && !!getTransactionTotals }), [balanceAccountId, getTransactionTotals]),
            queryFn: fetchCallback,
        });
        const isLoading = !balanceAccountId || isFetching || isAvailableCurrenciesFetching;

        const getTotals = useCallback(() => {
            if (!availableCurrencies || !data) {
                return data?.data;
            }

            const partialTotals = availableCurrencies.map(currency => {
                const totalOfCurrency = data.data.find(total => total.currency === currency);
                return totalOfCurrency || { currency, incomings: 0, expenses: 0 };
            });

            return partialTotals.concat(data.data.filter(total => !partialTotals.includes(total)));
        }, [availableCurrencies, data]);

        const totals = getTotals() ?? [];
        const isXsContainer = useResponsiveContainer(containerQueries.only.xs);

        return (
            <div className={BASE_CLASS}>
                {isXsContainer ? (
                    <>
                        <div className={ITEM_CLASS}>
                            <TotalsCard
                                aria-label={i18n.get('transactions.overview.totals.labels.incoming')}
                                totals={totals}
                                isLoading={isLoading}
                                hiddenField="expenses"
                                fullWidth={fullWidth}
                            />
                        </div>
                        <div className={ITEM_CLASS}>
                            <TotalsCard
                                aria-label={i18n.get('transactions.overview.totals.labels.outgoing')}
                                totals={totals}
                                isLoading={isLoading}
                                hiddenField="incomings"
                                fullWidth={fullWidth}
                            />
                        </div>
                    </>
                ) : (
                    <TotalsCard
                        aria-label={i18n.get('transactions.overview.totals.labels.default')}
                        totals={totals}
                        isLoading={isLoading}
                        fullWidth={fullWidth}
                    />
                )}
            </div>
        );
    }
);

export default TransactionTotals;
