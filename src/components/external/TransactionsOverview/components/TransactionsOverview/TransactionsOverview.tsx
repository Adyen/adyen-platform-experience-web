import cx from 'classnames';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
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
import { TransactionOverviewProps, TransactionsView } from '../../types';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { compareTransactionsFilters } from '../utils';
import { Header } from '../../../../internal/Header';
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
    const cachedFilters = useRef(INITIAL_FILTERS);
    const filterBarState = useFilterBarState();

    const [filters, setFilters] = useState(cachedFilters.current);
    const [activeView, setActiveView] = useState(TransactionsView.TRANSACTIONS);
    const [insightsCurrency, setInsightsCurrency] = useState<string>();

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;

    const canFetchTransactions = useMemo(
        () => isTransactionsView && !!balanceAccount?.id && compareTransactionsFilters(filters, cachedFilters.current),
        [isTransactionsView, balanceAccount, filters]
    );

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: canFetchTransactions,
        allowLimitSelection,
        dataCustomization,
        filters,
        onFiltersChanged,
        preferredLimit,
    });

    const transactionsTotalsResult = useTransactionsTotals({
        currencies: accountBalancesResult.currencies,
        fetchEnabled: !!balanceAccount?.id,
        loadingBalances: accountBalancesResult.isWaiting,
        filters,
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

    useEffect(() => {
        if (canFetchTransactions) {
            cachedFilters.current = filters;
        }
    }, [canFetchTransactions, filters]);

    return (
        <div className={cx(classes.root, { [classes.rootSmall]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
                {!isMobileContainer && <>{viewSwitcher}</>}
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
                {/* [TODO]: Mobile responsiveness for export button */}
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
                    transactionsTotalsResult={transactionsTotalsResult}
                />
            ) : (
                <TransactionsOverviewInsights currency={insightsCurrency} transactionsTotalsResult={transactionsTotalsResult} />
            )}
        </div>
    );
};
