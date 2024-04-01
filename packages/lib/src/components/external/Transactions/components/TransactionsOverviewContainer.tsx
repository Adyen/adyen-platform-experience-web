import { TransactionsComponentProps } from '../types';
import { ExternalUIComponentProps } from '../../../types';
import './TransactionList.scss';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { TransactionsOverview } from '@src/components/external/Transactions/components/TransactionsOverview';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import useAuthContext from '@src/core/Auth/useAuthContext';
import cx from 'classnames';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';

function TransactionsOverviewComponent(props: ExternalUIComponentProps<TransactionsComponentProps>) {
    const { sessionSetupError, endpoints } = useAuthContext();

    // Balance Accounts
    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data, isFetching } = useFetch({
        fetchOptions: { enabled: !!endpoints.getBalanceAccounts, keepPrevData: true },
        queryFn: useCallback(async () => {
            return balanceAccountEndpointCall(EMPTY_OBJECT);
        }, [balanceAccountEndpointCall]),
    });

    const balanceAccounts = useMemo(() => data?.balanceAccounts, [data?.balanceAccounts]);

    return (
        <div
            className={cx('adyen-fp-transactions', {
                'adyen-fp-transactions__with-error': sessionSetupError,
            })}
        >
            {sessionSetupError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={['weCouldNotLoadTheTransactionsOverview', 'tryRefreshingThePageOrComeBackLater']}
                    refreshComponent={true}
                />
            ) : (
                <div className="adyen-fp-transactions__container">
                    <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
                </div>
            )}
        </div>
    );
}

export default TransactionsOverviewComponent;
