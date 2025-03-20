import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import { DisputeOverviewComponentProps, ExternalUIComponentProps } from '../../../../types';
import { DisputesOverview } from '../DisputesOverview/DisputesOverview';

function ReportsOverviewContainer({ ...props }: ExternalUIComponentProps<DisputeOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className="adyen-pe-disputes-overview-container"
            errorMessage={'disputes.weCouldNotLoadTheDisputesOverviewComponent'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <DisputesOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default ReportsOverviewContainer;
