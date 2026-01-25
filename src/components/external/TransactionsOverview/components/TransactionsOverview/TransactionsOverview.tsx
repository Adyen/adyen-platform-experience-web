import cx from 'classnames';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsFilters from '../../hooks/useTransactionsFilters';
import useTransactionsViewSwitcher from '../../hooks/useTransactionsViewSwitcher';
import useTransactionsTotals, { GetQueryParams } from '../../hooks/useTransactionsTotals';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import TransactionsOverviewList from './TransactionsOverviewList';
import TransactionsOverviewInsights from './TransactionsOverviewInsights';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionsExport from '../TransactionsExport/TransactionsExport';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { TransactionOverviewProps, TransactionsView } from '../../types';
import { Header } from '../../../../internal/Header';
import { useMemo, useState } from 'preact/hooks';
import { classes } from '../../constants';
import './TransactionsOverview.scss';

const getTransactionsListTotalsQuery: GetQueryParams = allQueryParams => allQueryParams;

const getTransactionsInsightsTotalsQuery: GetQueryParams = allQueryParams => {
    const { balanceAccountId, createdSince, createdUntil } = allQueryParams;
    return { balanceAccountId, createdSince, createdUntil };
};

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
    const { activeView, onViewChange, viewTabs } = useTransactionsViewSwitcher();
    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;

    const {
        filters,
        onFiltersChange,
        lastFiltersChangeTimestamp,
        insightsFiltersPendingRefresh,
        transactionsFiltersChanged,
        transactionsFiltersPendingRefresh,
    } = useTransactionsFilters({ activeView });

    const filterBarState = useFilterBarState();

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: transactionsFiltersChanged,
        now: lastFiltersChangeTimestamp,
        allowLimitSelection,
        dataCustomization,
        onFiltersChanged,
        preferredLimit,
        filters,
    });

    const transactionsListTotalsResult = useTransactionsTotals({
        currencies: accountBalancesResult.currencies,
        fetchEnabled: transactionsFiltersPendingRefresh,
        loadingBalances: accountBalancesResult.isWaiting,
        getQueryParams: getTransactionsListTotalsQuery,
        now: lastFiltersChangeTimestamp,
        filters,
    });

    const transactionsInsightsTotalsResult = useTransactionsTotals({
        currencies: accountBalancesResult.currencies,
        fetchEnabled: insightsFiltersPendingRefresh,
        loadingBalances: accountBalancesResult.isWaiting,
        getQueryParams: getTransactionsInsightsTotalsQuery,
        now: lastFiltersChangeTimestamp,
        filters,
    });

    const exportButton = useMemo(
        () =>
            isTransactionsView ? (
                <TransactionsExport
                    disabled={transactionsListResult.records.length < 1 || transactionsListResult.fetching}
                    filters={filters}
                    now={lastFiltersChangeTimestamp}
                />
            ) : null,
        [filters, isTransactionsView, lastFiltersChangeTimestamp, transactionsListResult.fetching, transactionsListResult.records]
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
                    availableCurrencies={accountBalancesResult.currencies}
                    balanceAccounts={balanceAccounts}
                    isTransactionsView={isTransactionsView}
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
