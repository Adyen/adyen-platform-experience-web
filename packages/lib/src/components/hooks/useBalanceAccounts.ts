import { useAuthContext } from '../../core/Auth';
import { useFetch } from '../../hooks/useFetch/useFetch';
import { EMPTY_OBJECT } from '../../primitives/utils';
import { useMemo } from 'preact/hooks';

const useBalanceAccounts = (balanceAccountId?: string) => {
    const { getBalanceAccounts: balanceAccountEndpointCall } = useAuthContext().endpoints;

    const { data, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!balanceAccountEndpointCall, keepPrevData: true },
                queryFn: async () => balanceAccountEndpointCall?.(EMPTY_OBJECT),
            }),
            [balanceAccountEndpointCall]
        )
    );

    const balanceAccounts = useMemo(
        () => data?.balanceAccounts.filter(account => (balanceAccountId ? account.id === balanceAccountId : true)),
        [data?.balanceAccounts, balanceAccountId]
    );

    const wrongBalanceAccountId = useMemo(
        () => !!balanceAccountId && !!data?.balanceAccounts.length && balanceAccounts?.length === 0,
        [balanceAccounts?.length, data?.balanceAccounts.length, balanceAccountId]
    );

    return { balanceAccounts, wrongBalanceAccountId, isFetching } as const;
};

export default useBalanceAccounts;
