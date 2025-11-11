import { IBalance, IBalanceAccountBase } from '../types';
import { EMPTY_ARRAY, isFunction } from '../utils';
import { createAbortable } from '../primitives/async/abortable';
import { useConfigContext } from '../core/ConfigContext';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import { useFetch } from './useFetch';

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
                const json = await getBalances({ signal }, { path });
                if (!signal.aborted) return json?.data;
            } catch (error) {
                if (!signal.aborted) throw error;
            }
        }
    }, [abortable, balanceAccountId, canFetchBalances, getBalances]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: { enabled: canFetchBalances },
        queryFn: fetchBalances,
    });

    const { balances, balancesLookup, currencies } = useMemo(() => {
        const balances = [...(Array.isArray(data) ? data : (EMPTY_ARRAY as unknown as Readonly<IBalance>[]))];
        const currencySortedBalances = [...balances].sort(({ currency: a }, { currency: b }) => a.localeCompare(b));
        const balancesLookup = Object.freeze(Object.fromEntries(balances.map(balance => [balance.currency, balance])));
        const currencies = Object.freeze([...new Set(currencySortedBalances.map(({ currency }) => currency))]);
        return { balances, balancesLookup, currencies } as const;
    }, [data]);

    return {
        balances,
        balancesLookup,
        currencies,
        error,
        isAvailable: canGetBalances,
        isEmpty: !!error || !currencies.length,
        isMultiCurrency: currencies.length > 1,
        isWaiting: isFetching || (canGetBalances && !balanceAccountId),
    } as const;
};

export default useAccountBalances;
