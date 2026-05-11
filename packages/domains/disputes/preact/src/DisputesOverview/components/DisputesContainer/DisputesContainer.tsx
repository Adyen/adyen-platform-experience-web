import { useBalanceAccounts } from '@integration-components/hooks-preact';
import DataOverviewContainer from '@integration-components/ui-primitives-preact/DataOverviewContainer/DataOverviewContainer';
import type { ExternalUIComponentProps } from '@integration-components/types';
import { DisputeOverviewComponentProps } from '../../types';
import { DisputesOverview } from '../DisputesOverview/DisputesOverview';

function DisputesOverviewContainer({ ...props }: ExternalUIComponentProps<DisputeOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className="adyen-pe-disputes-overview-container"
            errorMessage={'disputes.overview.common.errors.unavailable'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <DisputesOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default DisputesOverviewContainer;
