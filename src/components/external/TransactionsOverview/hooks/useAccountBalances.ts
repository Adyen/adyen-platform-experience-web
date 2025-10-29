import { IBalanceAccountBase } from '../../../../types';
import { EMPTY_ARRAY, isFunction } from '../../../../utils';
import { createAbortable } from '../../../../primitives/async/abortable';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import { useFetch } from '../../../../hooks/useFetch';

const useAccountBalances = (balanceAccount?: IBalanceAccountBase) => {
    const { getBalances } = useConfigContext().endpoints;
    const abortable = useRef(createAbortable()).current;
    const balanceAccountId = balanceAccount?.id;
    const canGetBalances = isFunction(getBalances);
    const canFetchBalances = canGetBalances && !!balanceAccountId;

    const fetchBalances = useCallback(async () => {
        if (canFetchBalances) {
            const { signal } = abortable.refresh(true);
            try {
                const path = { balanceAccountId };
                const { data } = await getBalances({ signal }, { path });
                if (!signal.aborted) return data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, balanceAccountId, canFetchBalances, getBalances]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: { enabled: canFetchBalances },
        queryFn: fetchBalances,
    });

    const balances = useMemo(() => {
        // [TODO]: Update API specification to include reservedValue
        const balancesData = data || (EMPTY_ARRAY as NonNullable<typeof data>);
        const balancesMap = new Map<string, Readonly<{ available: number /*, reserved: number */ }>>();

        balancesData.forEach(({ currency, value: available /*, reservedValue: reserved */ }) => {
            balancesMap.set(currency, { available /*, reserved */ } as const);
        });

        const balancesEntriesSortedByCurrency = [...balancesMap.entries()].sort(([a], [b]) => a.localeCompare(b));
        return Object.freeze(Object.fromEntries(balancesEntriesSortedByCurrency));
    }, [data]);

    const currencies = useMemo(() => Object.freeze(Object.keys(balances)), [balances]);

    return {
        balances,
        currencies,
        error,
        isAvailable: canGetBalances,
        isEmpty: !!error || !currencies.length,
        isWaiting: isFetching || (canGetBalances && !balanceAccountId),
    } as const;
};

export default useAccountBalances;
