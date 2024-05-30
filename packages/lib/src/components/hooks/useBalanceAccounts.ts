import { useFetch } from '../../hooks/useFetch/useFetch';
import { useSetupEndpoint } from '../../hooks/useSetupEndpoint/useSetupEndpoint';
import { EMPTY_OBJECT } from '../../utils';
import { useMemo } from 'preact/hooks';

const useBalanceAccounts = (balanceAccountId?: string) => {
    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data, isFetching, error } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!balanceAccountEndpointCall, keepPrevData: true },
                queryFn: async () => balanceAccountEndpointCall(EMPTY_OBJECT),
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
