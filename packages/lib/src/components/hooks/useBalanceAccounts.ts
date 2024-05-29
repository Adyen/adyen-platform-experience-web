import useAuthContext from '../../core/Auth/useAuthContext';
import { useFetch } from '../../hooks/useFetch/useFetch';
import { useSetupEndpoint } from '../../hooks/useSetupEndpoint/useSetupEndpoint';
import { EMPTY_OBJECT } from '../../utils/common';
import { useCallback, useMemo } from 'preact/hooks';

const useBalanceAccounts = (balanceAccountId?: string) => {
    const { endpoints } = useAuthContext();

    // Balance Accounts
    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data, isFetching, error } = useFetch({
        fetchOptions: { enabled: !!endpoints.getBalanceAccounts, keepPrevData: true },
        queryFn: useCallback(async () => {
            return balanceAccountEndpointCall(EMPTY_OBJECT);
        }, [balanceAccountEndpointCall]),
    });

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
