import { BalanceAccountsProps, DataOverviewComponentProps } from '@src/types';
import { BASE_CLASS, WITH_ERROR_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsOverviewContainer/constants';
import { PayoutsOverview } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/PayoutsOverview';
import { ExternalUIComponentProps } from '@src/components/types';
import useAuthContext from '@src/core/Auth/useAuthContext';
import withBalanceAccounts from '@src/hoc/withBalanceAccounts';
import cx from 'classnames';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import './PayoutsOverviewContainer.scss';

//TODO: HOC that gets balance accounts and renders the correct component
function PayoutsOverviewContainer({
    balanceAccounts,
    isFetchingBalanceAccounts,
    wrongBalanceAccountId,
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
                    message={['weCouldNotLoadThePayoutsOverview', 'tryRefreshingThePageOrComeBackLater']}
                    refreshComponent={true}
                />
            ) : wrongBalanceAccountId ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={['weCouldNotLoadThePayoutsOverview', 'theSelectedBalanceAccountIsIncorrect']}
                />
            ) : (
                <PayoutsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetchingBalanceAccounts} />
            )}
        </div>
    );
}

export default withBalanceAccounts(PayoutsOverviewContainer);
