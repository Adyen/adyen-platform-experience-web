import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';

const useBalanceAccounts = (balanceAccountId?: string, enabled?: boolean) => {
    const { getBalanceAccounts } = useConfigContext().endpoints;

    const { data, isFetching, error } = useFetch({
        queryFn: useCallback(async () => getBalanceAccounts?.(EMPTY_OBJECT), [getBalanceAccounts]),
        fetchOptions: { enabled: !!getBalanceAccounts && enabled !== false, keepPrevData: true },
    });

    const balanceAccounts = useMemo(
        () => data?.data.filter(account => (balanceAccountId ? account.id === balanceAccountId : true)),
        [data?.data, balanceAccountId]
    );

    const isBalanceAccountIdWrong = useMemo(
        () => !!balanceAccountId && !!data?.data.length && balanceAccounts?.length === 0,
        [data?.data, balanceAccountId, balanceAccounts]
    );

    // TODO: Consider unifying error with isBalanceAccountIdWrong
    return { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } as const;
};

export default useBalanceAccounts;
