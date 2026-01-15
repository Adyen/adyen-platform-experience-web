import cx from 'classnames';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsTotals, { GetQueryParams } from '../../hooks/useTransactionsTotals';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import TransactionsOverviewList from './TransactionsOverviewList';
import TransactionsOverviewInsights from './TransactionsOverviewInsights';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionsExport from '../TransactionsExport/TransactionsExport';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { classes, INITIAL_FILTERS, TRANSACTIONS_VIEW_TABS } from '../../constants';
import { SegmentedControlItem } from '../../../../internal/SegmentedControl/types';
import { TransactionOverviewProps, TransactionsView, TransactionsFilters as Filters } from '../../types';
import { useMemo, useRef, useState } from 'preact/hooks';
import { compareTransactionsFilters } from '../utils';
import { Header } from '../../../../internal/Header';
import './TransactionsOverview.scss';

const getTransactionsListTotalsQuery: GetQueryParams = allQueryParams => allQueryParams;

const getTransactionsInsightsTotalsQuery: GetQueryParams = allQueryParams => {
    const { balanceAccountId, createdSince, createdUntil } = allQueryParams;
    return { balanceAccountId, createdSince, createdUntil };
};

const transactionsInsightsFilterSet = new Set<keyof Filters>(['balanceAccount', 'createdDate']);

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
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [activeView, setActiveView] = useState(TransactionsView.TRANSACTIONS);
    const [insightsCurrency, setInsightsCurrency] = useState<string>();

    const cachedListFilters = useRef(filters);
    const cachedInsightsFilters = useRef(filters);
    const filterBarState = useFilterBarState();

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const hasChangedFilters = useMemo(
        () => ({
            list: compareTransactionsFilters(filters, cachedListFilters.current),
            insights: compareTransactionsFilters(filters, cachedInsightsFilters.current, transactionsInsightsFilterSet),
        }),
        [filters]
    );

    const shouldFetchTransactions = !!balanceAccount?.id && hasChangedFilters.list && cachedListFilters.current !== filters;
    const shouldFetchTransactionsInsights = !!balanceAccount?.id && hasChangedFilters.insights && cachedInsightsFilters.current !== filters;

    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;
    const canFetchTransactions = isTransactionsView && shouldFetchTransactions;
    const canFetchTransactionsInsights = !isTransactionsView && shouldFetchTransactionsInsights;

    const listFilters = canFetchTransactions ? (cachedListFilters.current = filters) : cachedListFilters.current;
    const insightsFilters = canFetchTransactionsInsights ? (cachedInsightsFilters.current = filters) : cachedInsightsFilters.current;

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: canFetchTransactions,
        allowLimitSelection,
        dataCustomization,
        filters: listFilters,
        onFiltersChanged,
        preferredLimit,
    });

    const transactionsListTotalsResult = useTransactionsTotals({
        currencies: accountBalancesResult.currencies,
        fetchEnabled: canFetchTransactions,
        loadingBalances: accountBalancesResult.isWaiting,
        getQueryParams: getTransactionsListTotalsQuery,
        filters: listFilters,
    });

    const transactionsInsightsTotalsResult = useTransactionsTotals({
        currencies: accountBalancesResult.currencies,
        fetchEnabled: canFetchTransactionsInsights,
        loadingBalances: accountBalancesResult.isWaiting,
        getQueryParams: getTransactionsInsightsTotalsQuery,
        filters: insightsFilters,
    });

    const exportButton = useMemo(
        () =>
            isTransactionsView ? (
                <TransactionsExport disabled={transactionsListResult.records.length < 1 || transactionsListResult.fetching} filters={filters} />
            ) : null,
        [filters, isTransactionsView, transactionsListResult.fetching, transactionsListResult.records]
    );

    const viewSwitcher = useMemo(
        () =>
            TRANSACTIONS_VIEW_TABS.length > 1 ? (
                <SegmentedControl
                    aria-label={i18n.get('transactions.overview.viewSelect.a11y.label')}
                    activeItem={activeView}
                    items={TRANSACTIONS_VIEW_TABS}
                    onChange={({ id }: SegmentedControlItem<TransactionsView>) => setActiveView(id)}
                />
            ) : null,
        [activeView, i18n]
    );

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
                    availableCurrencies={accountBalancesResult.currencies}
                    balanceAccounts={balanceAccounts}
                    isTransactionsView={isTransactionsView}
                    setInsightsCurrency={setInsightsCurrency}
                    onChange={setFilters}
                />
                {!isMobileContainer && <>{exportButton}</>}
            </div>

            {isTransactionsView ? (
                <TransactionsOverviewList
                    accountBalancesResult={accountBalancesResult}
                    balanceAccount={balanceAccount}
                    balanceAccounts={balanceAccounts}
                    dataCustomization={dataCustomization}
                    isLoadingBalanceAccount={isLoadingBalanceAccount}
                    onContactSupport={onContactSupport}
                    onRecordSelection={onRecordSelection}
                    showDetails={showDetails}
                    transactionsListResult={transactionsListResult}
                    transactionsTotalsResult={transactionsListTotalsResult}
                />
            ) : (
                <TransactionsOverviewInsights currency={insightsCurrency} transactionsTotalsResult={transactionsInsightsTotalsResult} />
            )}
        </div>
    );
};
