import useAuthContext from '../../core/Auth/useAuthContext';
import { useFetch } from '../../hooks/useFetch/useFetch';
import { useSetupEndpoint } from '../../hooks/useSetupEndpoint/useSetupEndpoint';
import { EMPTY_OBJECT } from '../../utils/common';
import { useCallback, useMemo } from 'preact/hooks';

const useBalanceAccounts = (balanceAccountId?: string) => {
    const { endpoints } = useAuthContext();

    // Balance Accounts
    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data, isFetching } = useFetch({
        fetchOptions: { enabled: !!endpoints.getBalanceAccounts, keepPrevData: true },
        queryFn: useCallback(async () => {
            return balanceAccountEndpointCall(EMPTY_OBJECT);
        }, [balanceAccountEndpointCall]),
    });

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
