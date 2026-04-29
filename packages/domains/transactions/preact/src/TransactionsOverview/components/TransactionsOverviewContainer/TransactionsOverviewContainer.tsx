import useBalanceAccounts from '../../../../../../../../src/hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../../../../../src/components/internal/DataOverviewContainer/DataOverviewContainer';
import type { ExternalUIComponentProps, TransactionsOverviewComponentProps } from '../../../../../../../../src/components/types';
import { TransactionsOverview } from '../TransactionsOverview/TransactionsOverview';
import { BASE_CLASS } from './constants';

function TransactionsOverviewContainer({ ...props }: ExternalUIComponentProps<TransactionsOverviewComponentProps>) {
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
