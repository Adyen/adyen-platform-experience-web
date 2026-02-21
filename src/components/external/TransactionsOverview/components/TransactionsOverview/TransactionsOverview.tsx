import cx from 'classnames';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsViewSwitcher from '../../hooks/useTransactionsViewSwitcher';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';
import TransactionsOverviewList from './TransactionsOverviewList';
import TransactionsOverviewInsights from './TransactionsOverviewInsights';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionsExport from '../TransactionsExport/TransactionsExport';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { useTransactionsFilters } from '../../hooks/useTransactionsFilters';
import { TransactionOverviewProps, TransactionsView } from '../../types';
import { Header } from '../../../../internal/Header';
import { useMemo, useState } from 'preact/hooks';
import { classes } from '../../constants';
import './TransactionsOverview.scss';

export const TransactionsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit,
    onRecordSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    dataCustomization,
}: TransactionOverviewProps) => {
    const [insightsCurrency, setInsightsCurrency] = useState<string>();
    const filterBarState = useFilterBarState();
    const filters = useTransactionsFilters({ onFiltersChanged });

    const { i18n } = useCoreContext();
    const { isMobileContainer } = filterBarState;
    const { activeView, onViewChange, viewTabs } = useTransactionsViewSwitcher();

    const filtersLoading = filters.loading;
    const balanceAccount = filters.balanceAccount.value;
    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;
    const hasActiveBalanceAccount = !!balanceAccount?.id;

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const insightsTotalsResult = useTransactionsTotals({
        fetchEnabled: !isTransactionsView && hasActiveBalanceAccount,
        query: filters.insightsFiltersQuery,
        filtersLoading,
    });

    const transactionsTotalsResult = useTransactionsTotals({
        fetchEnabled: isTransactionsView && hasActiveBalanceAccount,
        query: filters.transactionsFiltersQuery,
        filtersLoading,
    });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: hasActiveBalanceAccount,
        query: filters.transactionsFiltersQuery,
        filterParams: filters.transactionsFilterParams,
        allowLimitSelection,
        dataCustomization,
        preferredLimit,
        filtersLoading,
    });

    const currenciesLookupResult = useCurrenciesLookup({
        defaultCurrency: balanceAccount?.defaultCurrencyCode,
        balances: accountBalancesResult.balances,
        totals: (isTransactionsView ? transactionsTotalsResult : insightsTotalsResult).totals,
    });

    const exportButton = useMemo(
        () => (isTransactionsView ? <TransactionsExport disabled={!transactionsListResult.page} query={filters.transactionsFiltersQuery} /> : null),
        [isTransactionsView, filters.transactionsFiltersQuery, transactionsListResult.page]
    );

    const viewSwitcher = useMemo(
        () =>
            viewTabs.length > 1 ? (
                <SegmentedControl
                    aria-label={i18n.get('transactions.overview.viewSelect.a11y.label')}
                    activeItem={activeView}
                    items={viewTabs}
                    onChange={onViewChange}
                />
            ) : null,
        [activeView, onViewChange, viewTabs, i18n]
    );

    console.log('here...');

    return (
        <div className={cx(classes.root, { [classes.rootSmall]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <div className={cx({ [classes.filterBarSmall]: isMobileContainer })}>
                    {isMobileContainer && exportButton}
                    <FilterBarMobileSwitch {...filterBarState} />
                    {!isMobileContainer && <>{viewSwitcher}</>}
                </div>
            </Header>

            {isMobileContainer && <>{viewSwitcher}</>}

            <div role="toolbar" className={classes.toolbar}>
                <TransactionsFilters
                    {...filterBarState}
                    availableCurrencies={currenciesLookupResult.sortedCurrencies}
                    balanceAccounts={balanceAccounts}
                    isTransactionsView={isTransactionsView}
                    insightsCurrency={insightsCurrency}
                    setInsightsCurrency={setInsightsCurrency}
                    filters={filters}
                />
                {!isMobileContainer && <>{exportButton}</>}
            </div>

            {isTransactionsView ? (
                <TransactionsOverviewList
                    accountBalancesResult={accountBalancesResult}
                    balanceAccount={balanceAccount}
                    balanceAccounts={balanceAccounts}
                    currenciesLookupResult={currenciesLookupResult}
                    dataCustomization={dataCustomization}
                    isLoadingBalanceAccount={isLoadingBalanceAccount}
                    onContactSupport={onContactSupport}
                    onRecordSelection={onRecordSelection}
                    showDetails={showDetails}
                    transactionsListResult={transactionsListResult}
                    transactionsTotalsResult={transactionsTotalsResult}
                />
            ) : (
                <TransactionsOverviewInsights
                    currency={insightsCurrency}
                    currenciesLookupResult={currenciesLookupResult}
                    transactionsTotalsResult={insightsTotalsResult}
                />
            )}
        </div>
    );
};
