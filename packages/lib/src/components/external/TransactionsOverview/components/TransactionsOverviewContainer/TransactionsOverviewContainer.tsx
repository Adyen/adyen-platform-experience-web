import { TransactionsComponentProps } from '../../types';
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
import Theme from '../../../../../theme/Theme';

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
        () => data?.balanceAccounts.filter(account => (props.balanceAccountId ? account.id === props.balanceAccountId : true)),
        [data?.balanceAccounts, props.balanceAccountId]
    );

    const wrongBalanceAccountId = useMemo(
        () => !!props.balanceAccountId && !!data?.balanceAccounts.length && balanceAccounts?.length === 0,
        [balanceAccounts?.length, data?.balanceAccounts.length, props.balanceAccountId]
    );

    /*    $my-neutral-scale: generate-grey-scale(#ffe6c9, 0);
    $my-primary-scale: generate-color-scale(#8b2f00, 32);
    $my-label-scale: generate-color-scale(#1d1d1d, 32);
    $my-primary-background: #fffaf8;

    $my-critical-scale: generate-color-scale(#f00, 19);
    $my-success-scale: generate-color-scale(#25c000, 17);
    $my-warning-scale: generate-color-scale(#25c000, 17);*/

    new Theme({ primary: '#8b2f00', neutral: '#ffe6c9' }).apply();

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
