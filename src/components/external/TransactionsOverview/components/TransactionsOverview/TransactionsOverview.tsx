import cx from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import { Header } from '../../../../internal/Header';
import { isFunction } from '../../../../../utils';
import { IBalanceAccountBase } from '../../../../../types';
import { INITIAL_FILTERS } from '../TransactionsOverviewFilters/constants';
import { DEFAULT_PAGE_LIMIT } from '../../../../internal/Pagination/constants';
import { BASE_CLASS, BASE_XS_CLASS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS, TRANSACTIONS_VIEW_TABS, TransactionsView } from './constants';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { SegmentedControlItem } from '../../../../internal/SegmentedControl/types';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import TransactionsOverviewFilters from '../TransactionsOverviewFilters/TransactionsOverviewFilters';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import TransactionsList from '../TransactionsList/TransactionsList';
import './TransactionsOverview.scss';

export const TransactionsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
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
    const cachedFilters = useRef(filters);
    const userEvents = useAnalyticsContext();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);

    useEffect(() => {
        userEvents.addEvent?.('Landed on page', {
            category: 'PIE components',
            subCategory: 'Transactions overview',
        });
    }, [userEvents]);

    useEffect(() => {
        if (cachedFilters.current !== filters) {
            cachedFilters.current = filters;
            _onFiltersChanged?.({
                balanceAccount: filters.balanceAccount?.id,
                statuses: String(filters.statuses) || undefined,
                categories: String(filters.categories) || undefined,
                currencies: String(filters.currencies) || undefined,
                createdSince: new Date(filters.createdDate.from).toISOString(),
                createdUntil: new Date(filters.createdDate.to).toISOString(),
                maxAmount: undefined,
                minAmount: undefined,
            });
        }
    }, [_onFiltersChanged, filters]);

    const balanceAccount = filters.balanceAccount;
    const balanceAccountId = balanceAccount?.id;

    const {
        balances,
        currencies,
        isEmpty: balancesEmpty,
        isMultiCurrency: hasMultipleCurrencies,
        isWaiting: loadingBalances,
    } = useAccountBalances(balanceAccount);

    const filterBarState = useFilterBarState();
    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const [activeView, setActiveView] = useState(TransactionsView.TRANSACTIONS);

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
                <div className={SUMMARY_CLASS}>
                    <div className={SUMMARY_ITEM_CLASS}>
                        <TransactionTotals
                            availableCurrencies={currencies as (typeof currencies)[number][]}
                            isAvailableCurrenciesFetching={loadingBalances}
                            balanceAccountId={balanceAccountId}
                            statuses={filters.statuses as (typeof filters.statuses)[number][]}
                            categories={filters.categories as (typeof filters.categories)[number][]}
                            createdUntil={new Date(filters.createdDate.to).toISOString()}
                            createdSince={new Date(filters.createdDate.from).toISOString()}
                            currencies={filters.currencies as (typeof filters.currencies)[number][]}
                            minAmount={undefined}
                            maxAmount={undefined}
                            fullWidth={isNarrowContainer}
                        />
                    </div>
                </div>
            ) : (
                <TransactionsList
                    allowLimitSelection={allowLimitSelection}
                    availableCurrencies={currencies}
                    balances={balances}
                    balancesEmpty={balancesEmpty}
                    dataCustomization={dataCustomization}
                    filters={filters}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                    loadingBalances={loadingBalances}
                    onContactSupport={onContactSupport}
                    onRecordSelection={onRecordSelection}
                    preferredLimit={preferredLimit}
                    showDetails={showDetails}
                />
            )}
        </div>
    );
};
