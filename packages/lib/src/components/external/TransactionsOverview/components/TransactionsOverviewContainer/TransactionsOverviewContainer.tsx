import useBalanceAccounts from '../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import { DataOverviewComponentProps } from '../../../../../types';
import { BASE_CLASS } from './constants';
import { ExternalUIComponentProps } from '../../../../types';
import { TransactionsOverview } from '../TransactionsOverview/TransactionsOverview';

function TransactionsOverviewContainer({ ...props }: ExternalUIComponentProps<DataOverviewComponentProps>) {
    const { balanceAccounts, wrongBalanceAccountId, isFetching } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            className={BASE_CLASS}
            errorMessage={'weCouldNotLoadTheTransactionsOverview'}
            wrongBalanceAccountId={wrongBalanceAccountId}
        >
            <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}

export default TransactionsOverviewContainer;
