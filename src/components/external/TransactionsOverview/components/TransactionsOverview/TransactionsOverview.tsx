import cx from 'classnames';
import { useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import { Balances } from '../Balances/Balances';
import { Header } from '../../../../internal/Header';
import { IBalanceAccountBase } from '../../../../../types';
import { INITIAL_FILTERS } from '../TransactionsOverviewFilters/constants';
import { BASE_CLASS, BASE_XS_CLASS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS, TRANSACTIONS_VIEW_TABS, TransactionsView } from './constants';
import { SegmentedControlItem } from '../../../../internal/SegmentedControl/types';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import TransactionsOverviewFilters from '../TransactionsOverviewFilters/TransactionsOverviewFilters';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import TransactionsList from '../TransactionsList/TransactionsList';
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
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [activeView, setActiveView] = useState(TransactionsView.TRANSACTIONS);

    const filterBarState = useFilterBarState();
    const userEvents = useAnalyticsContext();

    useEffect(() => {
        userEvents.addEvent?.('Landed on page', {
            category: 'PIE components',
            subCategory: 'Transactions overview',
        });
    }, [userEvents]);

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const canFetchTransactions = !!balanceAccount?.id;
    const canFetchTransactionsTotals = !!balanceAccount?.id;

    const {
        balances,
        currencies,
        isEmpty: balancesEmpty,
        isMultiCurrency: hasMultipleCurrencies,
        isWaiting: loadingBalances,
    } = useAccountBalances({ balanceAccount });

    const { totals, isWaiting: loadingTotals } = useTransactionsTotals({
        currencies,
        filters,
        loadingBalances,
        fetchEnabled: canFetchTransactionsTotals,
    });

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
        <div className={cx(BASE_CLASS, { [BASE_XS_CLASS]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
                {!isMobileContainer && <>{viewSwitcher}</>}
            </Header>

            {isMobileContainer && <>{viewSwitcher}</>}

            <TransactionsOverviewFilters
                {...filterBarState}
                activeView={activeView}
                availableCurrencies={currencies}
                balanceAccounts={balanceAccounts}
                eventCategory="Transaction component"
                onChange={setFilters}
            />

            {activeView === TransactionsView.INSIGHTS ? (
                <>
                    <div className={SUMMARY_CLASS}>
                        <div className={SUMMARY_ITEM_CLASS}>
                            <TransactionTotals balanceAccount={balanceAccount} loadingTotals={loadingTotals} totals={totals} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={SUMMARY_CLASS}>
                        <div className={SUMMARY_ITEM_CLASS}>
                            <Balances
                                balanceAccount={balanceAccount}
                                balances={balances}
                                balancesEmpty={balancesEmpty}
                                loadingBalances={loadingBalances}
                            />
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
            )}
        </div>
    );
};
