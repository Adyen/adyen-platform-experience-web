import FilterBar from '@src/components/internal/FilterBar';
import { ExternalUIComponentProps } from '@src/components/types';
import { TransactionsComponentProps, TransactionFilterParam } from '../../types';
import { TransactionsDisplay } from '@src/components/external/TransactionsOverview/components/TransactionsDisplay/TransactionsDisplay';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '@src/types';
import { isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import TransactionsOverviewDateFilter from '@src/components/external/TransactionsOverview/components/TransactionsOverviewDateFilter';
import TransactionTotals from '@src/components/external/TransactionsOverview/components/TransactionTotals/TransactionTotals';
import { Balances } from '@src/components/external/TransactionsOverview/components/Balances/Balances';
import BalanceAccountSelector, { useBalanceAccountSelection } from '../BalanceAccountSelector';
import MultiSelectionFilter, { listFrom } from '../MultiSelectionFilter';
import useDefaultTransactionsOverviewFilterParams from '../../hooks/useDefaultTransactionsOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { AmountFilter } from '@src/components/internal/FilterBar/filters/AmountFilter/AmountFilter';
import {
    BASE_CLASS,
    SUMMARY_CLASS,
    SUMMARY_ITEM_CLASS,
} from '@src/components/external/TransactionsOverview/components/TransactionsOverview/constants';
import './TransactionsOverview.scss';
import { mediaQueries, useMediaQuery } from '@src/components/external/TransactionsOverview/hooks/useMediaQuery';

export const TransactionsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onTransactionSelected,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
}: ExternalUIComponentProps<
    TransactionsComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const transactionsEndpointCall = useSetupEndpoint('getTransactions');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultTransactionsOverviewFilterParams(activeBalanceAccount);

    const getTransactions = useCallback(
        async ({ balanceAccount, ...pageRequestParams }: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions: SetupHttpOptions = { signal, errorLevel: 'error' };

            return transactionsEndpointCall(requestOptions, {
                query: {
                    ...pageRequestParams,
                    statuses: listFrom<ITransaction['status']>(pageRequestParams[TransactionFilterParam.STATUSES]),
                    categories: listFrom<ITransaction['category']>(pageRequestParams[TransactionFilterParam.CATEGORIES]),
                    currencies: listFrom<ITransaction['amount']['currency']>(pageRequestParams[TransactionFilterParam.CURRENCIES]),
                    createdSince:
                        pageRequestParams[TransactionFilterParam.CREATED_SINCE] ??
                        defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[TransactionFilterParam.CREATED_UNTIL] ??
                        defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                    balanceAccountId: activeBalanceAccount?.id ?? '',
                    minAmount: pageRequestParams.minAmount !== undefined ? parseFloat(pageRequestParams.minAmount) : undefined,
                    maxAmount: pageRequestParams.maxAmount !== undefined ? parseFloat(pageRequestParams.maxAmount) : undefined,
                },
            });
        },
        [activeBalanceAccount?.id, defaultParams, transactionsEndpointCall]
    );

    // FILTERS
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'transactions', string, TransactionFilterParam>({
            fetchRecords: getTransactions,
            dataField: 'transactions',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onLimitChanged: _onLimitChanged,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id,
        });

    const [availableCurrencies, setAvailableCurrencies] = useState<ITransaction['amount']['currency'][] | undefined>([]);
    const [isAvailableCurrenciesFetching, setIsAvailableCurrenciesFetching] = useState(false);
    const handleCurrenciesChange = useCallback((currencies: ITransaction['amount']['currency'][] | undefined, isFetching: boolean) => {
        setAvailableCurrencies(currencies);
        setIsAvailableCurrenciesFetching(isFetching);
    }, []);
    const { categoriesFilter, currenciesFilter, statusesFilter } = useTransactionsOverviewMultiSelectionFilters(
        {
            filters,
            updateFilters,
        },
        availableCurrencies
    );

    useEffect(() => {
        setAvailableCurrencies(undefined);
        updateFilters({
            [TransactionFilterParam.BALANCE_ACCOUNT]: activeBalanceAccount?.id,
            [TransactionFilterParam.CURRENCIES]: undefined,
        });
    }, [updateFilters, activeBalanceAccount?.id]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    // Set status filter's value fixed as "Booked" temporarily
    useEffect(() => {
        statusesFilter.updateSelection({ target: { value: 'Booked', name: 'status' } });
    }, [statusesFilter]);

    const isNarrowViewport = useMediaQuery(mediaQueries.down.sm);

    return (
        <div className={BASE_CLASS}>
            <FilterBar>
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <TransactionsOverviewDateFilter
                    canResetFilters={canResetFilters}
                    defaultParams={defaultParams}
                    filters={filters}
                    nowTimestamp={nowTimestamp}
                    refreshNowTimestamp={refreshNowTimestamp}
                    updateFilters={updateFilters}
                />
                {/* Remove status filter temporarily */}
                {/* <MultiSelectionFilter {...statusesFilter} placeholder={i18n.get('filterPlaceholder.status')} /> */}
                <MultiSelectionFilter {...categoriesFilter} placeholder={i18n.get('filterPlaceholder.category')} />
                <AmountFilter
                    availableCurrencies={availableCurrencies}
                    selectedCurrencies={listFrom(filters[TransactionFilterParam.CURRENCIES])}
                    name={'range'}
                    label={i18n.get('amount')}
                    minAmount={filters[TransactionFilterParam.MIN_AMOUNT]}
                    maxAmount={filters[TransactionFilterParam.MAX_AMOUNT]}
                    updateFilters={updateFilters}
                    onChange={updateFilters}
                />
                <MultiSelectionFilter {...currenciesFilter} placeholder={i18n.get('filterPlaceholder.currency')} />
            </FilterBar>
            <div className={SUMMARY_CLASS}>
                <div className={SUMMARY_ITEM_CLASS}>
                    <TransactionTotals
                        availableCurrencies={availableCurrencies}
                        isAvailableCurrenciesFetching={isAvailableCurrenciesFetching}
                        balanceAccountId={activeBalanceAccount?.id}
                        statuses={statusesFilter.selection}
                        categories={categoriesFilter.selection}
                        createdUntil={filters[TransactionFilterParam.CREATED_UNTIL]!}
                        createdSince={filters[TransactionFilterParam.CREATED_SINCE]!}
                        currencies={currenciesFilter.selection}
                        minAmount={filters[TransactionFilterParam.MIN_AMOUNT] ? parseFloat(filters[TransactionFilterParam.MIN_AMOUNT]) : undefined}
                        maxAmount={filters[TransactionFilterParam.MAX_AMOUNT] ? parseFloat(filters[TransactionFilterParam.MAX_AMOUNT]) : undefined}
                        fullWidth={isNarrowViewport}
                    />
                </div>
                <div className={SUMMARY_ITEM_CLASS}>
                    <Balances balanceAccountId={activeBalanceAccount?.id} onCurrenciesChange={handleCurrenciesChange} fullWidth={isNarrowViewport} />
                </div>
            </div>

            <TransactionsDisplay
                balanceAccounts={balanceAccounts}
                availableCurrencies={availableCurrencies}
                loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                transactions={records}
                onTransactionSelected={onTransactionSelected}
                showPagination={true}
                showDetails={showDetails}
                balanceAccountDescription={activeBalanceAccount?.description || ''}
                limit={limit}
                limitOptions={limitOptions}
                onContactSupport={onContactSupport}
                onLimitSelection={updateLimit}
                error={error as AdyenPlatformExperienceError}
                {...paginationProps}
            />
        </div>
    );
};
