import { useFetch } from '../../../../hooks/useFetch';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import { useConfigContext } from '../../../../core/ConfigContext';
import { createAbortable } from '../../../../primitives/async/abortable';
import { TransactionsOverviewFilters } from '../components/TransactionsOverviewFilters/types';
import { EMPTY_ARRAY, EMPTY_OBJECT, isFunction } from '../../../../utils';
import { ITransactionTotal } from '../../../../types';

export interface UseTransactionsTotalsProps {
    currencies: readonly string[];
    fetchEnabled: boolean;
    filters: Readonly<TransactionsOverviewFilters>;
    loadingBalances: boolean;
}

const useTransactionTotals = ({ currencies, fetchEnabled, filters, loadingBalances }: UseTransactionsTotalsProps) => {
    const { getTransactionTotals } = useConfigContext().endpoints;
    const abortable = useRef(createAbortable()).current;
    const canGetTransactionTotals = isFunction(getTransactionTotals);
    const canFetchTransactionTotals = canGetTransactionTotals && fetchEnabled;

    const fetchTransactionTotals = useCallback(async () => {
        if (canFetchTransactionTotals) {
            const { signal } = abortable.refresh(true);
            try {
                const query: Parameters<NonNullable<typeof getTransactionTotals>>[1]['query'] = {
                    balanceAccountId: filters.balanceAccount?.id ?? '',
                    createdSince: new Date(filters.createdDate.from).toISOString(),
                    createdUntil: new Date(filters.createdDate.to).toISOString(),
                    categories: filters.categories as (typeof filters.categories)[number][],
                    currencies: filters.currencies as (typeof filters.currencies)[number][],
                    statuses: filters.statuses as (typeof filters.statuses)[number][],
                    maxAmount: undefined,
                    minAmount: undefined,
                } as const;

                const json = await getTransactionTotals({ signal }, { query });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, canFetchTransactionTotals, filters, getTransactionTotals]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: { enabled: canFetchTransactionTotals },
        queryFn: fetchTransactionTotals,
    });

    const { totals, totalsLookup } = useMemo(() => {
        const records = Array.isArray(data) ? data : EMPTY_ARRAY;
        const totals: readonly Readonly<ITransactionTotal>[] = currencies.map((currentCurrency): Readonly<ITransactionTotal> => {
            const record = records.find(({ currency }) => currency === currentCurrency);
            return {
                currency: currentCurrency,
                expenses: 0,
                incomings: 0,
                // total: 0,
                // breakdown: {
                //     expenses: [],
                //     incomings: [],
                // },
                ...(record ?? EMPTY_OBJECT),
            };
        });
        const totalsLookup: Readonly<Record<string, (typeof totals)[number]>> = Object.fromEntries(totals.map(record => [record.currency, record]));
        return { totals, totalsLookup } as const;
    }, [data, currencies]);

    return {
        totals,
        totalsLookup,
        error,
        isAvailable: canGetTransactionTotals,
        isWaiting: isFetching || loadingBalances || (canGetTransactionTotals && !fetchEnabled),
    } as const;
};

export default useTransactionTotals;
