import { useBalanceAccounts } from '@integration-components/hooks-preact';
import type { ExternalUIComponentProps } from '@integration-components/types';
import type { ReportsOverviewComponentProps } from '@integration-components/reports/domain';
import DataOverviewContainer from '../../../../../../../../src/components/internal/DataOverviewContainer/DataOverviewContainer';
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
