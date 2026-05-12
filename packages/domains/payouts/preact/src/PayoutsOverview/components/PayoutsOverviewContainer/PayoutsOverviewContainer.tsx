import { useBalanceAccounts } from '@integration-components/hooks-preact';
import type { ExternalUIComponentProps } from '@integration-components/types';
import type { PayoutsOverviewComponentProps } from '@integration-components/payouts/domain';
import DataOverviewContainer from '@integration-components/ui-components-preact/DataOverviewContainer/DataOverviewContainer';
import { PayoutsOverview } from '../PayoutsOverview/PayoutsOverview';
import { BASE_CLASS } from './constants';

function PayoutsOverviewContainer({ ...props }: ExternalUIComponentProps<PayoutsOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'payouts.overview.errors.unavailable'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <PayoutsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}

export default PayoutsOverviewContainer;
