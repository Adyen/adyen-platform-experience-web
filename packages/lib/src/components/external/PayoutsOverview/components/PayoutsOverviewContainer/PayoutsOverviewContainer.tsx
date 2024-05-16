import useBalanceAccounts from '../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import type { DataOverviewComponentProps, ExternalUIComponentProps } from '../../../../types';
import { PayoutsOverview } from '../PayoutsOverview/PayoutsOverview';
import { BASE_CLASS } from './constants';

function PayoutsOverviewContainer({ ...props }: ExternalUIComponentProps<DataOverviewComponentProps>) {
    const { balanceAccounts, wrongBalanceAccountId, isFetching } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer className={BASE_CLASS} errorMessage={'weCouldNotLoadThePayoutsOverview'} wrongBalanceAccountId={wrongBalanceAccountId}>
            <PayoutsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
export default PayoutsOverviewContainer;
