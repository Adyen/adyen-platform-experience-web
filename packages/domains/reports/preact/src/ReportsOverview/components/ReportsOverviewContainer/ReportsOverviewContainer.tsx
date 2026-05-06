import { useBalanceAccounts } from '@integration-components/hooks-preact';
import type { ExternalUIComponentProps } from '@integration-components/types';
import { REPORTS_OVERVIEW_CONTAINER_CLASS_NAMES, type ReportsOverviewComponentProps } from '@integration-components/reports/domain';
import DataOverviewContainer from '../../../../../../../../src/components/internal/DataOverviewContainer/DataOverviewContainer';
import { ReportsOverview } from '../ReportsOverview/ReportsOverview';

function ReportsOverviewContainer({ ...props }: ExternalUIComponentProps<ReportsOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={REPORTS_OVERVIEW_CONTAINER_CLASS_NAMES.base}
            errorMessage={'reports.overview.errors.unavailable'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <ReportsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default ReportsOverviewContainer;
