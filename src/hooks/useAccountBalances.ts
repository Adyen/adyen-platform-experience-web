import { isFunction } from '../utils';
import { IBalance, IBalanceAccountBase } from '../types';
import { createAbortable } from '../primitives/async/abortable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';

export interface UseAccountBalancesProps {
    balanceAccount?: IBalanceAccountBase;
}

const useAccountBalances = ({ balanceAccount }: UseAccountBalancesProps) => {
    const [pendingRefresh, setPendingRefresh] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState(performance.now());
    const fetchTimestampRef = useRef<number>();

    const abortable = useRef(createAbortable()).current;
    const balanceAccountId = balanceAccount?.id;
    const fetchEnabled = !!balanceAccountId;

    const { getBalances } = useConfigContext().endpoints;
    const canGetBalances = isFunction(getBalances);
    const canFetchBalances = canGetBalances && fetchEnabled;
    const shouldFetchBalances = canFetchBalances && fetchTimestampRef.current !== fetchTimestamp;

    const fetchBalances = useCallback(async () => {
        if (shouldFetchBalances) {
            const { signal } = abortable.refresh(true);
            try {
                const path: Parameters<NonNullable<typeof getBalances>>[1]['path'] = { balanceAccountId };
                const json = await getBalances({ signal }, { path });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, balanceAccountId, getBalances, shouldFetchBalances]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: { enabled: shouldFetchBalances },
        queryFn: fetchBalances,
    });

    const cachedIsFetching = useRef(isFetching);
    const canRefresh = !isFetching && canFetchBalances;
    const balances = useMemo<readonly Readonly<IBalance>[]>(() => (Array.isArray(data) ? data : []), [data]);

    const refresh = useCallback(() => {
        if (canRefresh) setPendingRefresh(true);
    }, [canRefresh, isFetching]);

    useEffect(() => {
        if (balanceAccountId) {
            // The balance account ID has changed,
            // hence a new fetch request is required
            setFetchTimestamp(performance.now());
        }
    }, [balanceAccountId]);

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
        balances,
        error,
        canRefresh,
        refresh,
        isAvailable: canGetBalances,
        isWaiting: isFetching || (canGetBalances && !canFetchBalances && !data),
    } as const;
};

export default useAccountBalances;
