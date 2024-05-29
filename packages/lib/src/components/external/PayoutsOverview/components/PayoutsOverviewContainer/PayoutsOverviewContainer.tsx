import useBalanceAccounts from '../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import { DataOverviewComponentProps } from '../../../../../types';
import { BASE_CLASS } from './constants';
import { PayoutsOverview } from '../PayoutsOverview/PayoutsOverview';
import { ExternalUIComponentProps } from '../../../../types';

function PayoutsOverviewContainer({ ...props }: ExternalUIComponentProps<DataOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'weCouldNotLoadThePayoutsOverview'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <PayoutsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default PayoutsOverviewContainer;
