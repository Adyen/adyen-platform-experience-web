import { useFetch } from '../../../../hooks/useFetch';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { TransactionsInsightsQueryParams, TransactionsListQueryParams } from './useTransactionsFilters';
import { createAbortable } from '../../../../primitives/async/abortable';
import { ITransactionTotal } from '../../../../types';
import { isFunction } from '../../../../utils';

type TotalsQueryParams = TransactionsListQueryParams | TransactionsInsightsQueryParams;

export interface UseTransactionsTotalsProps {
    fetchEnabled: boolean;
    queryParams: TotalsQueryParams;
}

const useTransactionsTotals = ({ fetchEnabled, queryParams }: UseTransactionsTotalsProps) => {
    const [pendingRefresh, setPendingRefresh] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState(performance.now());
    const fetchTimestampRef = useRef<number>();

    const abortable = useRef(createAbortable()).current;
    const cachedQueryParams = useRef(queryParams);

    const { getTransactionTotals } = useConfigContext().endpoints;
    const canGetTransactionTotals = isFunction(getTransactionTotals);
    const canFetchTransactionTotals = canGetTransactionTotals && fetchEnabled;
    const shouldFetchTransactionTotals = canFetchTransactionTotals && fetchTimestampRef.current !== fetchTimestamp;

    const fetchTransactionTotals = useCallback(async () => {
        if (shouldFetchTransactionTotals) {
            const { signal } = abortable.refresh(true);
            try {
                const json = await getTransactionTotals({ signal }, { query: queryParams });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, queryParams, getTransactionTotals, shouldFetchTransactionTotals]);

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
        if (cachedQueryParams.current !== queryParams) {
            // The query params have changed,
            // hence a new fetch request is required
            setFetchTimestamp(performance.now());
            cachedQueryParams.current = queryParams;
        }
    }, [queryParams]);

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
