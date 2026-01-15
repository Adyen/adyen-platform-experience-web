import { useFetch } from '../../../../hooks/useFetch';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import { useConfigContext } from '../../../../core/ConfigContext';
import { createAbortable } from '../../../../primitives/async/abortable';
import { getTransactionsFilterQueryParams } from '../components/utils';
import { EMPTY_ARRAY, isFunction } from '../../../../utils';
import { ITransactionTotal } from '../../../../types';
import { TransactionsFilters } from '../types';

const ZERO_TOTALS = {
    expenses: 0,
    incomings: 0,
    total: 0,
    breakdown: {
        expenses: [] as const,
        incomings: [] as const,
    } as const,
} as const satisfies Omit<ITransactionTotal, 'currency'>;

type AllQueryParams = ReturnType<typeof getTransactionsFilterQueryParams>;
type TotalsQueryParams = Partial<AllQueryParams> & Pick<AllQueryParams, 'balanceAccountId'>;
export type GetQueryParams = (allQueryParams: AllQueryParams) => TotalsQueryParams;

export interface UseTransactionsTotalsProps {
    currencies: readonly string[];
    fetchEnabled: boolean;
    filters: Readonly<TransactionsFilters>;
    getQueryParams: GetQueryParams;
    loadingBalances: boolean;
}

const useTransactionsTotals = ({ currencies, fetchEnabled, filters, getQueryParams, loadingBalances }: UseTransactionsTotalsProps) => {
    const { getTransactionTotals } = useConfigContext().endpoints;
    const abortable = useRef(createAbortable()).current;
    const canGetTransactionTotals = isFunction(getTransactionTotals);
    const canFetchTransactionTotals = canGetTransactionTotals && fetchEnabled;

    const fetchTransactionTotals = useCallback(async () => {
        if (canFetchTransactionTotals) {
            const { signal } = abortable.refresh(true);
            try {
                const query = getQueryParams(getTransactionsFilterQueryParams(filters));
                const json = await getTransactionTotals({ signal }, { query });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, canFetchTransactionTotals, filters, getQueryParams, getTransactionTotals]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: { enabled: canFetchTransactionTotals },
        queryFn: fetchTransactionTotals,
    });

    const { totals, totalsLookup } = useMemo(() => {
        const records = Array.isArray(data) ? data : EMPTY_ARRAY;
        const totals: readonly Readonly<ITransactionTotal>[] = currencies.map((currentCurrency): Readonly<ITransactionTotal> => {
            const record = records.find(({ currency }) => currency === currentCurrency);
            return record ?? { ...ZERO_TOTALS, currency: currentCurrency };
        });
        const totalsLookup: Readonly<Record<string, (typeof totals)[number]>> = Object.fromEntries(totals.map(record => [record.currency, record]));
        return { totals, totalsLookup } as const;
    }, [data, currencies]);

    return {
        totals,
        totalsLookup,
        error,
        isAvailable: canGetTransactionTotals,
        isWaiting: isFetching || loadingBalances || (canGetTransactionTotals && !fetchEnabled && !data),
    } as const;
};

export default useTransactionsTotals;
