import useBalanceAccounts from '@src/components/hooks/useBalanceAccounts';
import DataOverviewContainer from '@src/components/internal/DataOverviewContainer/DataOverviewContainer';
import { DataOverviewComponentProps } from '@src/types';
import { BASE_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsOverviewContainer/constants';
import { PayoutsOverview } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/PayoutsOverview';
import { ExternalUIComponentProps } from '@src/components/types';

function PayoutsOverviewContainer({ ...props }: ExternalUIComponentProps<DataOverviewComponentProps>) {
    const { balanceAccounts, wrongBalanceAccountId, isFetching } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer className={BASE_CLASS} errorMessage={'weCouldNotLoadThePayoutsOverview'} wrongBalanceAccountId={wrongBalanceAccountId}>
            <PayoutsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default PayoutsOverviewContainer;
