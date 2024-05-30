import useBalanceAccounts from '../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import { DataOverviewComponentProps } from '../../../../../types';
import { BASE_CLASS } from './constants';
import { ExternalUIComponentProps } from '../../../../types';
import { TransactionsOverview } from '../TransactionsOverview/TransactionsOverview';

function TransactionsOverviewContainer({ ...props }: ExternalUIComponentProps<DataOverviewComponentProps>) {
    const { balanceAccounts, isFetching } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={true as any}
            className={BASE_CLASS}
            errorMessage={'weCouldNotLoadTheTransactionsOverview'}
            isBalanceAccountIdWrong={true}
            onContactSupport={props.onContactSupport}
        >
            <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}

export default TransactionsOverviewContainer;
