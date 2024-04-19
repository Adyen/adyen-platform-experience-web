import { BalanceAccountsProps, DataOverviewComponentProps } from '@src/types';
import { BASE_CLASS, WITH_ERROR_CLASS } from '@src/components/external/TransactionsOverview/components/TransactionsOverviewContainer/constants';
import { ExternalUIComponentProps } from '@src/components/types';
import withBalanceAccounts from '@src/hoc/withBalanceAccounts';
import { TransactionsOverview } from '@src/components/external/TransactionsOverview/components/TransactionsOverview/TransactionsOverview';
import useAuthContext from '@src/core/Auth/useAuthContext';
import cx from 'classnames';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import './TransactionsOverviewContainer.scss';

function TransactionsOverviewContainer({
    wrongBalanceAccountId,
    balanceAccounts,
    isFetchingBalanceAccounts,
    ...props
}: ExternalUIComponentProps<DataOverviewComponentProps> & BalanceAccountsProps) {
    const { sessionSetupError } = useAuthContext();

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
                <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetchingBalanceAccounts} />
            )}
        </div>
    );
}

export default withBalanceAccounts(TransactionsOverviewContainer);
