import { FilterType } from '../../../../../core/Analytics/analytics/user-events';
import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import { TransactionsTable, TRANSACTION_FIELDS } from '../TransactionsTable/TransactionsTable';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { TransactionOverviewComponentProps, ExternalUIComponentProps, FilterParam, CustomDataRetrieved } from '../../../../types';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { Header } from '../../../../internal/Header';
import { IBalanceAccountBase, ITransaction } from '../../../../../types';
import { hasOwnProperty, isFunction, isUndefined, listFrom } from '../../../../../utils';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import { Balances } from '../Balances/Balances';
import MultiSelectionFilter from '../MultiSelectionFilter';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { AmountFilter } from '../../../../internal/FilterBar/filters/AmountFilter/AmountFilter';
import { BASE_CLASS, BASE_CLASS_DETAILS, MAX_TRANSACTIONS_DATE_RANGE_MONTHS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS } from './constants';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { useCustomColumnsData } from '../../../../../hooks/useCustomColumnsData';
import hasCustomField from '../../../../utils/customData/hasCustomField';
import mergeRecords from '../../../../utils/customData/mergeRecords';
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
    const { i18n } = useCoreContext();
    const { getTransactions: transactionsEndpointCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('transactions', activeBalanceAccount);
    const userEvents = useAnalyticsContext();

    const getTransactions = useCallback(
        async ({ balanceAccount, ...pageRequestParams }: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return transactionsEndpointCall!(requestOptions, {
                query: {
                    ...pageRequestParams,
                    statuses: listFrom<ITransaction['status']>(pageRequestParams[FilterParam.STATUSES]),
                    categories: listFrom<ITransaction['category']>(pageRequestParams[FilterParam.CATEGORIES]),
                    currencies: listFrom<ITransaction['amount']['currency']>(pageRequestParams[FilterParam.CURRENCIES]),
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                    balanceAccountId: activeBalanceAccount?.id ?? '',
                    minAmount: !isUndefined(pageRequestParams.minAmount) ? parseFloat(pageRequestParams.minAmount) : undefined,
                    maxAmount: !isUndefined(pageRequestParams.maxAmount) ? parseFloat(pageRequestParams.maxAmount) : undefined,
                },
            });
        },
        [activeBalanceAccount?.id, defaultParams, transactionsEndpointCall]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'data', string, FilterParam>({
            fetchRecords: getTransactions,
            dataField: 'data',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id && !!transactionsEndpointCall,
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
            updateFilters: e => {
                if (hasOwnProperty(e, 'categories') && e.categories !== filters[FilterParam.CATEGORIES]) {
                    userEvents.addModifyFilterEvent?.({
                        actionType: 'update',
                        label: 'Category filter',
                        value: e[FilterParam.CATEGORIES],
                        category: 'Transaction component',
                    });
                }
                if (hasOwnProperty(e, 'currencies') && e.currencies !== filters[FilterParam.CURRENCIES]) {
                    userEvents.addModifyFilterEvent?.({
                        actionType: 'update',
                        label: 'Currency filter',
                        value: e[FilterParam.CURRENCIES],
                        category: 'Transaction component',
                    });
                }
                updateFilters(e);
            },
        },
        availableCurrencies
    );

    useEffect(() => {
        userEvents.addEvent?.('Landed on page', {
            category: 'PIE components',
            subCategory: 'Transactions overview',
        });
    }, [userEvents]);

    useEffect(() => {
        setAvailableCurrencies(undefined);
        updateFilters({
            [FilterParam.BALANCE_ACCOUNT]: activeBalanceAccount?.id,
            [FilterParam.CURRENCIES]: undefined,
        });
    }, [updateFilters, activeBalanceAccount?.id]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    // Set status filter's value fixed as "Booked" temporarily
    useEffect(() => {
        statusesFilter.updateSelection({ target: { value: 'Booked', name: 'status' } });
    }, [statusesFilter]);

    const isNarrowContainer = useResponsiveContainer(containerQueries.down.sm);

    const hasMultipleCurrencies = !!availableCurrencies && availableCurrencies.length > 1;

    const transactionDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        }),
        [showDetails, onRecordSelection]
    );

    const modalOptions = useMemo(() => ({ transaction: transactionDetails }), [transactionDetails]);

    const mergeCustomData = useCallback(
        ({ records, retrievedData }: { records: ITransaction[]; retrievedData: CustomDataRetrieved[] }) =>
            mergeRecords(records, retrievedData, (modifiedRecord, record) => modifiedRecord.id === record.id),
        []
    );

    const hasCustomColumn = useMemo(() => hasCustomField(dataCustomization?.list?.fields, TRANSACTION_FIELDS), [dataCustomization?.list?.fields]);

    const { customRecords: transactions, loadingCustomRecords } = useCustomColumnsData<ITransaction>({
        records,
        hasCustomColumn,
        onDataRetrieve: dataCustomization?.list?.onDataRetrieve,
        mergeCustomData,
    });
    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        ({ id, category }: ITransaction) => {
            if (category) {
                userEvents.addEvent?.('Viewed transaction details', {
                    transactionType: category,
                    category: 'Transaction component',
                    subCategory: 'Transaction details',
                });
            }
            updateDetails({
                selection: {
                    type: 'transaction',
                    data: id,
                    balanceAccount: activeBalanceAccount || '',
                },
                modalSize: 'small',
            }).callback({ id });
        },
        [activeBalanceAccount, updateDetails, userEvents]
    );

    const onResetAction = useCallback(
        (type: FilterType) => {
            userEvents.addModifyFilterEvent?.({
                actionType: 'reset',
                label: type,
                category: 'Transaction component',
            });
        },
        [userEvents]
    );

    const onResetAmountFilter = useMemo(() => onResetAction.bind(null, 'Amount filter'), [onResetAction]);
    const onResetDateFilter = useMemo(() => onResetAction.bind(null, 'Date filter'), [onResetAction]);
    const onResetCurrencyFilter = useMemo(() => onResetAction.bind(null, 'Currency filter'), [onResetAction]);
    const onResetCategoryFilter = useMemo(() => onResetAction.bind(null, 'Category filter'), [onResetAction]);

    const sinceDate = useMemo(() => {
        const date = new Date(nowTimestamp);
        date.setMonth(date.getMonth() - MAX_TRANSACTIONS_DATE_RANGE_MONTHS);
        return date.toString();
    }, [nowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <FilterBar {...filterBarState} ariaLabelKey="transactions.overview.filters.label">
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <DateFilter
                    canResetFilters={canResetFilters}
                    defaultParams={defaultParams}
                    filters={filters}
                    nowTimestamp={nowTimestamp}
                    refreshNowTimestamp={refreshNowTimestamp}
                    sinceDate={sinceDate}
                    timezone={activeBalanceAccount?.timeZone}
                    updateFilters={e => {
                        if (e?.createdSince !== filters[FilterParam.CREATED_SINCE] || e?.createdUntil !== filters[FilterParam.CREATED_UNTIL]) {
                            userEvents.addModifyFilterEvent?.({
                                actionType: 'update',
                                label: 'Date filter',
                                category: 'Transaction component',
                                value: `${e[FilterParam.CREATED_SINCE]},${e[FilterParam.CREATED_UNTIL]}`,
                            });
                        }
                        updateFilters(e);
                    }}
                    onResetAction={onResetDateFilter}
                />
                {/* Remove status filter temporarily */}
                {/* <MultiSelectionFilter {...statusesFilter} placeholder={i18n.get('transactions.overview.filters.types.status.label')} /> */}
                <MultiSelectionFilter
                    {...categoriesFilter}
                    onResetAction={onResetCategoryFilter}
                    placeholder={i18n.get('transactions.overview.filters.types.category.label')}
                />
                <AmountFilter
                    availableCurrencies={availableCurrencies}
                    selectedCurrencies={listFrom(filters[FilterParam.CURRENCIES])}
                    name={i18n.get('transactions.overview.filters.types.amount.label')}
                    label={i18n.get('transactions.overview.filters.types.amount.label')}
                    minAmount={filters[FilterParam.MIN_AMOUNT]}
                    maxAmount={filters[FilterParam.MAX_AMOUNT]}
                    updateFilters={e => {
                        const hasValue = e?.maxAmount || e?.minAmount;
                        if (hasValue && (e?.maxAmount !== filters[FilterParam.MAX_AMOUNT] || e?.minAmount !== filters[FilterParam.MIN_AMOUNT])) {
                            userEvents.addModifyFilterEvent?.({
                                actionType: 'update',
                                label: 'Amount filter',
                                category: 'Transaction component',
                                value: `${e[FilterParam.MIN_AMOUNT]},${e[FilterParam.MAX_AMOUNT]}`,
                            });
                        }
                        updateFilters(e);
                    }}
                    onChange={updateFilters}
                    onResetAction={onResetAmountFilter}
                />
                <MultiSelectionFilter
                    {...currenciesFilter}
                    onResetAction={onResetCurrencyFilter}
                    placeholder={i18n.get('transactions.overview.filters.types.currency.label')}
                />
            </FilterBar>
            <div className={SUMMARY_CLASS}>
                <div className={SUMMARY_ITEM_CLASS}>
                    <TransactionTotals
                        availableCurrencies={availableCurrencies}
                        isAvailableCurrenciesFetching={isAvailableCurrenciesFetching}
                        balanceAccountId={activeBalanceAccount?.id}
                        statuses={statusesFilter.selection}
                        categories={categoriesFilter.selection}
                        createdUntil={filters[FilterParam.CREATED_UNTIL]!}
                        createdSince={filters[FilterParam.CREATED_SINCE]!}
                        currencies={currenciesFilter.selection}
                        minAmount={filters[FilterParam.MIN_AMOUNT] ? parseFloat(filters[FilterParam.MIN_AMOUNT]) : undefined}
                        maxAmount={filters[FilterParam.MAX_AMOUNT] ? parseFloat(filters[FilterParam.MAX_AMOUNT]) : undefined}
                        fullWidth={isNarrowContainer}
                    />
                </div>
                <div className={SUMMARY_ITEM_CLASS}>
                    <Balances
                        balanceAccount={activeBalanceAccount}
                        onCurrenciesChange={handleCurrenciesChange}
                        defaultCurrencyCode={activeBalanceAccount?.defaultCurrencyCode}
                        fullWidth={isNarrowContainer}
                    />
                </div>
            </div>

            <DataDetailsModal
                ariaLabelKey="transactions.details.title"
                dataCustomization={dataCustomization?.details}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                className={BASE_CLASS_DETAILS}
            >
                <TransactionsTable
                    activeBalanceAccount={activeBalanceAccount}
                    availableCurrencies={availableCurrencies}
                    error={error as AdyenPlatformExperienceError}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    limit={limit}
                    limitOptions={limitOptions}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts || loadingCustomRecords}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    onRowClick={onRowClick}
                    showPagination={true}
                    transactions={dataCustomization?.list?.onDataRetrieve ? transactions : records}
                    customColumns={dataCustomization?.list?.fields}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
