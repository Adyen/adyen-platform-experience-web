import useAuthContext from '@src/core/Auth/useAuthContext';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useCallback, useMemo } from 'preact/hooks';

export const withBalanceAccounts = (WrappedComponent: any) => {
    return (props: any) => {
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
            () => data?.balanceAccounts.filter(account => (props.balanceAccountId ? account.id === props.balanceAccountId : true)),
            [data?.balanceAccounts, props.balanceAccountId]
        );

        const wrongBalanceAccountId = useMemo(
            () => !!props.balanceAccountId && !!data?.balanceAccounts.length && balanceAccounts?.length === 0,
            [balanceAccounts?.length, data?.balanceAccounts.length, props.balanceAccountId]
        );

        return (
            <WrappedComponent
                balanceAccounts={balanceAccounts}
                isFetchingBalanceAccounts={isFetching}
                wrongBalanceAccountId={wrongBalanceAccountId}
            />
        );
    };
};

export default withBalanceAccounts;
