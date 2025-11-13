import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Header } from '../../../../internal/Header';
import { isFunction } from '../../../../../utils';
import { IBalanceAccountBase, ITransaction } from '../../../../../types';
import { DEFAULT_PAGE_LIMIT } from '../../../../internal/Pagination/constants';
import { BASE_CLASS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS, TransactionsOverviewSplitView } from './constants';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import TransactionsOverviewFilters, { INITIAL_FILTERS } from '../TransactionsOverviewFilters/TransactionsOverviewFilters';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import './TransactionsOverview.scss';
import { TransactionsList } from '../TransactionsList/TransactionsList';

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
    const [activeView, setActiveView] = useState(TransactionsOverviewSplitView.TRANSACTIONS);
    const userEvents = useAnalyticsContext();

    const cachedFilters = useRef(filters);

    const [availableCurrencies, setAvailableCurrencies] = useState<string[] | undefined>([]);
    const [isAvailableCurrenciesFetching, setIsAvailableCurrenciesFetching] = useState(false);

    const handleCurrenciesChange = useCallback((currencies: ITransaction['amount']['currency'][] | undefined, isFetching: boolean) => {
        setAvailableCurrencies(currencies);
        setIsAvailableCurrenciesFetching(isFetching);
    }, []);

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);

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

    const balanceAccountId = filters.balanceAccount?.id;

    useEffect(() => {
        userEvents.addEvent?.('Landed on page', {
            category: 'PIE components',
            subCategory: 'Transactions overview',
        });
    }, [userEvents]);

    useEffect(() => {
        setAvailableCurrencies([]);
    }, [balanceAccountId]);

    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <TransactionsOverviewFilters
                {...filterBarState}
                activeView={activeView}
                availableCurrencies={availableCurrencies}
                balanceAccounts={balanceAccounts}
                eventCategory="Transaction component"
                onChange={setFilters}
            />

            {activeView === TransactionsOverviewSplitView.INSIGHTS ? (
                <div className={SUMMARY_CLASS}>
                    <div className={SUMMARY_ITEM_CLASS}>
                        <TransactionTotals
                            availableCurrencies={availableCurrencies}
                            isAvailableCurrenciesFetching={isAvailableCurrenciesFetching}
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
                    availableCurrencies={availableCurrencies}
                    dataCustomization={dataCustomization}
                    filters={filters}
                    loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                    onContactSupport={onContactSupport}
                    onCurrenciesChange={handleCurrenciesChange}
                    onRecordSelection={onRecordSelection}
                    preferredLimit={preferredLimit}
                    showDetails={showDetails}
                />
            )}
        </div>
    );
};
