import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import type { TransactionOverviewComponentProps, ExternalUIComponentProps } from '../../../../types';
import { TransactionsOverview } from '../TransactionsOverview/TransactionsOverview';
import { BASE_CLASS } from './constants';

function TransactionsOverviewContainer({ ...props }: ExternalUIComponentProps<TransactionOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'transactions.overview.errors.unavailable'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}

export default TransactionsOverviewContainer;
