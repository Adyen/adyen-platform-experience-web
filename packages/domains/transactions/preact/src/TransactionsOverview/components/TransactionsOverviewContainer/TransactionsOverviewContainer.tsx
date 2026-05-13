import { useBalanceAccounts } from '@integration-components/hooks-preact';
import DataOverviewContainer from '../../../../../../../../src/components/internal/DataOverviewContainer/DataOverviewContainer';
import type { ExternalUIComponentProps } from '@integration-components/types';
import type { TransactionsOverviewComponentProps } from '../../types';
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
