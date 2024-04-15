import { PayoutsOverview } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/PayoutsOverview';
import { OverviewComponentProps } from '../../types';
import { ExternalUIComponentProps } from '../../../../types';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { TransactionsOverview } from '@src/components/external/TransactionsOverview/components/TransactionsOverview/TransactionsOverview';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import useAuthContext from '@src/core/Auth/useAuthContext';
import cx from 'classnames';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { BASE_CLASS, WITH_ERROR_CLASS } from '@src/components/external/TransactionsOverview/components/TransactionsOverviewContainer/constants';
import './TransactionsOverviewContainer.scss';

function OverviewContainer({ type, ...props }: ExternalUIComponentProps<OverviewComponentProps>) {
    const { sessionSetupError, endpoints } = useAuthContext();

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
        <div className={cx(BASE_CLASS, { [WITH_ERROR_CLASS]: sessionSetupError })}>
            {sessionSetupError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={['weCouldNotLoadTheTransactionsOverview', 'tryRefreshingThePageOrComeBackLater']}
                    refreshComponent={true}
                />
            ) : wrongBalanceAccountId ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={['weCouldNotLoadTheTransactionsOverview', 'theSelectedBalanceAccountIsIncorrect']}
                />
            ) : (
                <>
                    {type === 'transactions' && (
                        <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
                    )}
                    {type === 'payouts' && <PayoutsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />}
                </>
            )}
        </div>
    );
}

export default OverviewContainer;
