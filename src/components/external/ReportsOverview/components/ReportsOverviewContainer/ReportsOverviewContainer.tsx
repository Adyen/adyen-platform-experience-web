import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import type { ExternalUIComponentProps, ReportsOverviewComponentProps } from '../../../../types';
import { ReportsOverview } from '../ReportsOverview/ReportsOverview';
import { BASE_CLASS } from './constants';

function ReportsOverviewContainer({ ...props }: ExternalUIComponentProps<ReportsOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'reports.overview.errors.unavailable'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <ReportsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default ReportsOverviewContainer;
