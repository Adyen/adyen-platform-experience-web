import useBalanceAccounts from '../../../BalanceAccountSelector/hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import type { ReportsOverviewComponentProps, UIComponentProps } from '../../../../types';
import { ReportsOverview } from '../ReportsOverview/ReportsOverview';
import { BASE_CLASS } from './constants';

function ReportsOverviewContainer(props: UIComponentProps<ReportsOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'weCouldNotLoadTheReportsOverview'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <ReportsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default ReportsOverviewContainer;
