import useBalanceAccounts from '@src/components/hooks/useBalanceAccounts';
import DataOverviewContainer from '@src/components/internal/DataOverviewContainer/DataOverviewContainer';
import { DataOverviewComponentProps } from '@src/types';
import { BASE_CLASS } from '@src/components/external/TransactionsOverview/components/TransactionsOverviewContainer/constants';
import { ExternalUIComponentProps } from '@src/components/types';
import { TransactionsOverview } from '@src/components/external/TransactionsOverview/components/TransactionsOverview/TransactionsOverview';
import './TransactionsOverviewContainer.scss';

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
