import { useFetch } from '../../../../hooks/useFetch';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { compareTransactionsFilters, getTransactionsFilterQueryParams } from '../components/utils';
import { createAbortable } from '../../../../primitives/async/abortable';
import { isFunction } from '../../../../utils';
import { ITransactionTotal } from '../../../../types';
import { TransactionsFilters } from '../types';

type AllQueryParams = ReturnType<typeof getTransactionsFilterQueryParams>;
type TotalsQueryParams = Partial<AllQueryParams> & Pick<AllQueryParams, 'balanceAccountId'>;
export type GetQueryParams = (allQueryParams: AllQueryParams) => TotalsQueryParams;

export interface UseTransactionsTotalsProps {
    fetchEnabled: boolean;
    filters: Readonly<TransactionsFilters>;
    applicableFilters?: Set<keyof TransactionsFilters>;
    getQueryParams: GetQueryParams;
    now: number;
}

const useTransactionsTotals = ({ applicableFilters, fetchEnabled, filters, getQueryParams, now }: UseTransactionsTotalsProps) => {
    const [pendingRefresh, setPendingRefresh] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState(performance.now());
    const fetchTimestampRef = useRef<number>();

    const abortable = useRef(createAbortable()).current;
    const cachedFilters = useRef(filters);

    const { getTransactionTotals } = useConfigContext().endpoints;
    const canGetTransactionTotals = isFunction(getTransactionTotals);
    const canFetchTransactionTotals = canGetTransactionTotals && fetchEnabled;
    const shouldFetchTransactionTotals = canFetchTransactionTotals && fetchTimestampRef.current !== fetchTimestamp;

    const fetchTransactionTotals = useCallback(async () => {
        if (shouldFetchTransactionTotals) {
            const { signal } = abortable.refresh(true);
            try {
                const query = getQueryParams(getTransactionsFilterQueryParams(filters, now));
                const json = await getTransactionTotals({ signal }, { query });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, filters, getQueryParams, getTransactionTotals, now, shouldFetchTransactionTotals]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: { enabled: shouldFetchTransactionTotals },
        queryFn: fetchTransactionTotals,
    });

    const cachedIsFetching = useRef(isFetching);
    const canRefresh = !isFetching && canFetchTransactionTotals;
    const totals = useMemo<readonly Readonly<ITransactionTotal>[]>(() => (Array.isArray(data) ? data : []), [data]);

    const refresh = useCallback(() => {
        if (canRefresh) setPendingRefresh(true);
    }, [canRefresh, isFetching]);

    useEffect(() => {
        if (cachedFilters.current === filters) return;

        const applicableFiltersDidChange = compareTransactionsFilters(filters, cachedFilters.current, applicableFilters);

        if (applicableFiltersDidChange) {
            // The applicable filters have changed,
            // hence a new fetch request is required
            setFetchTimestamp(performance.now());
            cachedFilters.current = filters;
        }
    }, [filters, applicableFilters]);

    useEffect(() => {
        if (pendingRefresh) {
            // A new fetch request is required
            setPendingRefresh(false);
            setFetchTimestamp(performance.now());
        }
    }, [pendingRefresh]);

    useEffect(() => {
        if (cachedIsFetching.current && !isFetching) {
            // Last fetch request has finished,
            // update fetch timestamp
            fetchTimestampRef.current = fetchTimestamp;
        }
        cachedIsFetching.current = isFetching;
    }, [isFetching, fetchTimestamp]);

    return {
        totals,
        error,
        canRefresh,
        refresh,
        isAvailable: canGetTransactionTotals,
        isWaiting: isFetching || (canGetTransactionTotals && !canFetchTransactionTotals && !data),
    } as const;
};

export default useTransactionsTotals;
