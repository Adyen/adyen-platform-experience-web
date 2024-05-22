import { TransactionsComponentProps } from '../../types';
import { ExternalUIComponentProps } from '../../../../types';
import { useSetupEndpoint } from '../../../../../hooks/useSetupEndpoint/useSetupEndpoint';
import { useFetch } from '../../../../../hooks/useFetch/useFetch';
import { TransactionsOverview } from '../TransactionsOverview/TransactionsOverview';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils/common';
import useAuthContext from '../../../../../core/Auth/useAuthContext';
import cx from 'classnames';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { BASE_CLASS, WITH_ERROR_CLASS } from './constants';
import './TransactionsOverviewContainer.scss';

function TransactionsOverviewContainer(props: ExternalUIComponentProps<TransactionsComponentProps>) {
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
        () => data?.data.filter(account => (props.balanceAccountId ? account.id === props.balanceAccountId : true)),
        [data?.data, props.balanceAccountId]
    );

    const wrongBalanceAccountId = useMemo(
        () => !!props.balanceAccountId && !!data?.data.length && balanceAccounts?.length === 0,
        [balanceAccounts?.length, data?.data.length, props.balanceAccountId]
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
                <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
            )}
        </div>
    );
}

export default TransactionsOverviewContainer;
