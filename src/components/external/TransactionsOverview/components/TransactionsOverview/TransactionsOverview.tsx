import cx from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { classes, INITIAL_FILTERS, TRANSACTIONS_VIEW_TABS } from '../../constants';
import { compareTransactionsFilters } from '../utils';
import { Header } from '../../../../internal/Header';
import { TransactionsView } from '../../types';
import { IBalanceAccountBase } from '../../../../../types';
import { SegmentedControlItem } from '../../../../internal/SegmentedControl/types';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionsExport from '../TransactionsExport/TransactionsExport';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import TransactionsList from '../TransactionsList/TransactionsList';
import InsightsTotals from '../InsightsTotals/InsightsTotals';
import Balances from '../Balances/Balances';
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
}: ExternalUIComponentProps<
    TransactionOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const cachedFilters = useRef(INITIAL_FILTERS);
    const filterBarState = useFilterBarState();
    const userEvents = useAnalyticsContext();

    const [filters, setFilters] = useState(cachedFilters.current);
    const [activeView, setActiveView] = useState(TransactionsView.TRANSACTIONS);
    const [insightsCurrency, setInsightsCurrency] = useState<string>();

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const defaultCurrencyCode = balanceAccount?.defaultCurrencyCode;
    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;

    const canFetchTransactions = useMemo(
        () => isTransactionsView && !!balanceAccount?.id && compareTransactionsFilters(filters, cachedFilters.current),
        [isTransactionsView, balanceAccount, filters]
    );

    const defaultCurrencyFirstSortFn = useCallback(
        <T extends { currency: string }>({ currency: firstCurrency }: T, { currency: secondCurrency }: T) => {
            if (defaultCurrencyCode) {
                if (firstCurrency === defaultCurrencyCode) return -1;
                if (secondCurrency === defaultCurrencyCode) return 1;
            }
            return firstCurrency.localeCompare(secondCurrency);
        },
        [defaultCurrencyCode]
    );

    const { balances, currencies, isMultiCurrency: hasMultipleCurrencies, isWaiting: loadingBalances } = useAccountBalances({ balanceAccount });

    const {
        totals,
        totalsLookup,
        isWaiting: loadingTotals,
    } = useTransactionsTotals({
        currencies,
        filters,
        loadingBalances,
        fetchEnabled: !!balanceAccount?.id,
    });

    const sortedBalances = useMemo(() => [...balances].sort(defaultCurrencyFirstSortFn), [balances, defaultCurrencyFirstSortFn]);
    const sortedTotals = useMemo(() => [...totals].sort(defaultCurrencyFirstSortFn), [totals, defaultCurrencyFirstSortFn]);

    const {
        error: transactionsError,
        fetching: loadingTransactions,
        fields: transactionsFields,
        records: transactions,
        updateLimit: onLimitSelection,
        hasCustomColumn,
        ...paginationProps
    } = useTransactionsList({
        allowLimitSelection,
        dataCustomization,
        filters,
        onFiltersChanged,
        preferredLimit,
        fetchEnabled: canFetchTransactions,
    });

    const exportButton = useMemo(
        () => (isTransactionsView ? <TransactionsExport disabled={transactions.length < 1 || loadingTransactions} filters={filters} /> : null),
        [isTransactionsView, transactions, filters]
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
        userEvents.addEvent?.('Landed on page', {
            category: 'PIE components',
            subCategory: 'Transactions overview',
        });
    }, [userEvents]);

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
                    activeView={activeView}
                    availableCurrencies={currencies}
                    balanceAccounts={balanceAccounts}
                    eventCategory="Transaction component"
                    insightsCurrency={insightsCurrency}
                    setInsightsCurrency={setInsightsCurrency}
                    onChange={setFilters}
                />
                {/* [TODO]: Mobile responsiveness for export button */}
                {!isMobileContainer && <>{exportButton}</>}
            </div>

            {isTransactionsView ? (
                <>
                    <div className={classes.summary}>
                        <div className={classes.summaryItem}>
                            <TransactionTotals totals={sortedTotals} loadingTotals={loadingTotals} />
                        </div>
                        <div className={classes.summaryItem}>
                            <Balances balances={sortedBalances} loadingBalances={loadingBalances} />
                        </div>
                    </div>

                    <TransactionsList
                        availableCurrencies={currencies}
                        balanceAccount={balanceAccount}
                        dataCustomization={dataCustomization}
                        hasMultipleCurrencies={hasMultipleCurrencies}
                        loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                        loadingTransactions={loadingTransactions}
                        onContactSupport={onContactSupport}
                        onLimitSelection={onLimitSelection}
                        onRecordSelection={onRecordSelection}
                        showDetails={showDetails}
                        transactionsError={transactionsError}
                        transactionsFields={transactionsFields}
                        transactions={transactions}
                        {...paginationProps}
                    />
                </>
            ) : (
                <InsightsTotals currency={insightsCurrency} loadingTotals={loadingTotals} totals={totalsLookup} />
            )}
        </div>
    );
};
