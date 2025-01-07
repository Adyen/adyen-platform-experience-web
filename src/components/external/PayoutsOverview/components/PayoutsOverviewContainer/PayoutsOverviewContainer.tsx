import useBalanceAccounts from '../../../BalanceAccountSelector/hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import type { PayoutsOverviewComponentProps, UIComponentProps } from '../../../../types';
import { PayoutsOverview } from '../PayoutsOverview/PayoutsOverview';
import { BASE_CLASS } from './constants';

function PayoutsOverviewContainer(props: UIComponentProps<PayoutsOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props);

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
