import cx from 'classnames';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsViewSwitcher from '../../hooks/useTransactionsViewSwitcher';
import useTransactionsTotals, { GetQueryParams } from '../../hooks/useTransactionsTotals';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';
import TransactionsOverviewList from './TransactionsOverviewList';
import TransactionsOverviewInsights from './TransactionsOverviewInsights';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionsExport from '../TransactionsExport/TransactionsExport';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { TransactionOverviewProps, TransactionsFilters as Filters, TransactionsView } from '../../types';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { classes, INITIAL_FILTERS } from '../../constants';
import { Header } from '../../../../internal/Header';
import './TransactionsOverview.scss';

const INSIGHTS_FILTERS_SET = new Set<keyof Filters>(['balanceAccount', 'createdDate']);
const getInsightsTotalsQueryParams: GetQueryParams = ({ balanceAccountId, createdSince, createdUntil }) => ({
    balanceAccountId,
    createdSince,
    createdUntil,
});
const getTransactionsTotalsQueryParams: GetQueryParams = allQueryParams => allQueryParams;

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
    const [lastFiltersChangeTimestamp, setLastFiltersChangeTimestamp] = useState(Date.now());
    const [insightsCurrency, setInsightsCurrency] = useState<string>();

    const filterBarState = useFilterBarState();

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const { activeView, onViewChange, viewTabs } = useTransactionsViewSwitcher();
    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;
    const hasActiveBalanceAccount = !!balanceAccount?.id;

    const onFiltersChange = useCallback((filters: Readonly<Filters>) => {
        setLastFiltersChangeTimestamp(Date.now());
        setFilters(filters);
    }, []);

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const insightsTotalsResult = useTransactionsTotals({
        fetchEnabled: !isTransactionsView && hasActiveBalanceAccount,
        getQueryParams: getInsightsTotalsQueryParams,
        applicableFilters: INSIGHTS_FILTERS_SET,
        now: lastFiltersChangeTimestamp,
        filters,
    });

    const transactionsTotalsResult = useTransactionsTotals({
        fetchEnabled: isTransactionsView && hasActiveBalanceAccount,
        getQueryParams: getTransactionsTotalsQueryParams,
        now: lastFiltersChangeTimestamp,
        filters,
    });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: hasActiveBalanceAccount,
        now: lastFiltersChangeTimestamp,
        allowLimitSelection,
        dataCustomization,
        onFiltersChanged,
        preferredLimit,
        filters,
    });

    const currenciesLookupResult = useCurrenciesLookup({
        defaultCurrency: balanceAccount?.defaultCurrencyCode,
        balances: accountBalancesResult.balances,
        totals: (isTransactionsView ? transactionsTotalsResult : insightsTotalsResult).totals,
    });

    const exportButton = useMemo(
        () =>
            isTransactionsView ? (
                <TransactionsExport disabled={!transactionsListResult.page} filters={filters} now={lastFiltersChangeTimestamp} />
            ) : null,
        [filters, isTransactionsView, lastFiltersChangeTimestamp, transactionsListResult.page]
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
                    onChange={onFiltersChange}
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
