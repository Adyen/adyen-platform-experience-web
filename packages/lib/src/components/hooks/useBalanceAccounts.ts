import { useAuthContext } from '../../core/Auth';
import { useFetch } from '../../hooks/useFetch/useFetch';
import { EMPTY_OBJECT } from '../../utils';
import { useMemo } from 'preact/hooks';

const useBalanceAccounts = (balanceAccountId?: string, enabled?: boolean) => {
    const { getBalanceAccounts: balanceAccountEndpointCall } = useAuthContext().endpoints;

    const { data, isFetching, error } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!balanceAccountEndpointCall && (enabled ?? true), keepPrevData: true },
                queryFn: async () => balanceAccountEndpointCall?.(EMPTY_OBJECT),
            }),
            [balanceAccountEndpointCall]
        )
    );

    const balanceAccounts = useMemo(
        () => data?.data.filter(account => (balanceAccountId ? account.id === balanceAccountId : true)),
        [data?.data, balanceAccountId]
    );

    const isBalanceAccountIdWrong = useMemo(
        () => !!balanceAccountId && !!data?.data.length && balanceAccounts?.length === 0,
        [balanceAccounts?.length, data?.data.length, balanceAccountId]
    );

    // TODO: Consider unifying error with isBalanceAccountIdWrong
    return { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } as const;
};

export default useBalanceAccounts;
