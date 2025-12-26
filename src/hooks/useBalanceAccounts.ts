import { IBalanceAccountBase } from '../types';
import { EMPTY_OBJECT, isFunction } from '../utils';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';

const cache = new WeakMap<(...args: any[]) => any, IBalanceAccountBase[]>();

const useBalanceAccounts = (balanceAccountId?: string, enabled?: boolean) => {
    const { getBalanceAccounts } = useConfigContext().endpoints;
    const [balanceAccountsFromCache, setBalanceAccountsFromCache] = useState(() => getBalanceAccounts && cache.get(getBalanceAccounts));

    const canFetchBalanceAccounts = useMemo(
        () => !balanceAccountsFromCache && isFunction(getBalanceAccounts) && enabled !== false,
        [balanceAccountsFromCache, enabled, getBalanceAccounts]
    );

    const { data, isFetching, error } = useFetch({
        queryFn: useCallback(async () => getBalanceAccounts?.(EMPTY_OBJECT), [getBalanceAccounts]),
        fetchOptions: { enabled: canFetchBalanceAccounts, keepPrevData: true },
    });

    const allBalanceAccounts = balanceAccountsFromCache ?? data?.data;

    const balanceAccounts = useMemo(
        () => allBalanceAccounts?.filter(account => !balanceAccountId || balanceAccountId === account.id),
        [allBalanceAccounts, balanceAccountId]
    );

    const isBalanceAccountIdWrong = useMemo(
        () => !!balanceAccountId && !!allBalanceAccounts?.length && balanceAccounts?.length === 0,
        [allBalanceAccounts, balanceAccountId, balanceAccounts]
    );

    useEffect(() => {
        if (data?.data && getBalanceAccounts) {
            const fetchedBalanceAccounts = data.data;
            cache.set(getBalanceAccounts, fetchedBalanceAccounts);
            setBalanceAccountsFromCache(fetchedBalanceAccounts);
        }
    }, [data, getBalanceAccounts]);

    // TODO: Consider unifying error with isBalanceAccountIdWrong
    return { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } as const;
};

export default useBalanceAccounts;
