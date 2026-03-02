import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import TransactionsOverviewShell from '../../../TransactionsOverview/components/TransactionsOverview/TransactionsOverviewShell';
import TransactionsOverviewInsights from '../../../TransactionsOverview/components/TransactionsOverview/TransactionsOverviewInsights';
import { TransactionsOverviewProvider } from '../../../TransactionsOverview/context/TransactionsOverviewContext';
import type { TransactionsInsightsComponentProps, ExternalUIComponentProps } from '../../../../types';
import { BASE_CLASS } from './constants';

function TransactionsInsightsContainer({ ...props }: ExternalUIComponentProps<TransactionsInsightsComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'transactions.insights.errors.unavailable' as any} /* [TODO]: Define translation key */
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <TransactionsOverviewProvider
                mode="insights"
                balanceAccounts={balanceAccounts}
                isLoadingBalanceAccount={isFetching}
                hideTitle={props.hideTitle}
                onContactSupport={props.onContactSupport}
                onFiltersChanged={props.onFiltersChanged}
            >
                <TransactionsOverviewShell>
                    <TransactionsOverviewInsights />
                </TransactionsOverviewShell>
            </TransactionsOverviewProvider>
        </DataOverviewContainer>
    );
}

export default TransactionsInsightsContainer;
