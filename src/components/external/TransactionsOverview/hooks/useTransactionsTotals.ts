import { useFetch } from '../../../../hooks/useFetch';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { operations } from '../../../../types/api/resources/TransactionsResourceV2';
import { createAbortable } from '../../../../primitives/async/abortable';
import { ITransactionTotal } from '../../../../types';
import { isFunction } from '../../../../utils';

export interface UseTransactionsTotalsProps {
    fetchEnabled: boolean;
    query: operations['getTransactionTotals']['parameters']['query'];
    filtersLoading?: boolean;
}

const useTransactionsTotals = ({ fetchEnabled, query, filtersLoading }: UseTransactionsTotalsProps) => {
    const [pendingRefresh, setPendingRefresh] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState(performance.now());
    const fetchTimestampRef = useRef<number>();

    const abortable = useRef(createAbortable()).current;
    const cachedQuery = useRef(query);

    const { getTransactionTotals } = useConfigContext().endpoints;
    const canGetTransactionTotals = isFunction(getTransactionTotals);
    const canFetchTransactionTotals = canGetTransactionTotals && fetchEnabled;
    const shouldFetchTransactionTotals = canFetchTransactionTotals && fetchTimestampRef.current !== fetchTimestamp;

    const fetchTransactionTotals = useCallback(async () => {
        if (shouldFetchTransactionTotals) {
            const { signal } = abortable.refresh(true);
            try {
                const json = await getTransactionTotals({ signal }, { query });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, getTransactionTotals, query, shouldFetchTransactionTotals]);

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
        if (cachedQuery.current === query) return;

        const queryDidChange = (Object.keys(query) as (keyof typeof query)[]).some(key => cachedQuery.current[key] !== query[key]);

        if (queryDidChange) {
            // The applicable filters have changed,
            // hence a new fetch request is required
            setFetchTimestamp(performance.now());
            cachedQuery.current = query;
        }
    }, [query]);

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
        isWaiting: !!filtersLoading || isFetching || (canGetTransactionTotals && !canFetchTransactionTotals && !data),
    } as const;
};

export default useTransactionsTotals;
