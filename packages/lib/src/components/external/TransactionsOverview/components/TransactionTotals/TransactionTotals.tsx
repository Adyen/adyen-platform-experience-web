import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../primitives/utils';
import { useAuthContext } from '../../../../../core/Auth';
import { useFetch } from '../../../../../hooks/useFetch/useFetch';
import { OperationParameters } from '../../../../../types/api/endpoints';
import { MakeFieldValueUndefined } from '../../../../../utils/types';
import { BASE_CLASS, ITEM_CLASS } from './constants';
import { memo } from 'preact/compat';
import { ITransaction } from '../../../../../types';
import { mediaQueries, useMediaQuery } from '../../hooks/useMediaQuery';
import './TransactionTotals.scss';
import { TotalsCard } from './TotalsCard';

type TransactionTotalsProps = Required<OperationParameters<'getTransactionTotals'>['query']> & {
    isAvailableCurrenciesFetching: boolean;
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
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
    }: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId' | 'minAmount' | 'maxAmount'>) => {
        const { getTransactionTotals } = useAuthContext().endpoints;

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
            fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
            queryFn: fetchCallback,
        });
        const isLoading = !balanceAccountId || isFetching || isAvailableCurrenciesFetching;

        const getTotals = useCallback(() => {
            if (!availableCurrencies || !data) {
                return data?.totals;
            }

            const partialTotals = availableCurrencies.map(currency => {
                const totalOfCurrency = data.totals.find(total => total.currency === currency);
                return totalOfCurrency || { currency, incomings: 0, expenses: 0 };
            });

            return partialTotals.concat(data.totals.filter(total => !partialTotals.includes(total)));
        }, [availableCurrencies, data]);

        const totals = getTotals() ?? [];
        const isXsScreen = useMediaQuery(mediaQueries.only.xs);

        return (
            <div className={BASE_CLASS}>
                {isXsScreen ? (
                    <>
                        <div className={ITEM_CLASS}>
                            <TotalsCard totals={totals} isLoading={isLoading} hiddenField="expenses" fullWidth={fullWidth} />
                        </div>
                        <div className={ITEM_CLASS}>
                            <TotalsCard totals={totals} isLoading={isLoading} hiddenField="incomings" fullWidth={fullWidth} />
                        </div>
                    </>
                ) : (
                    <TotalsCard totals={totals} isLoading={isLoading} fullWidth={fullWidth} />
                )}
            </div>
        );
    }
);

export default TransactionTotals;
