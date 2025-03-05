import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
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
import { EMPTY_OBJECT, isFunction, isUndefined, listFrom } from '../../../../../utils';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import { Balances } from '../Balances/Balances';
import MultiSelectionFilter from '../MultiSelectionFilter';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { AmountFilter } from '../../../../internal/FilterBar/filters/AmountFilter/AmountFilter';
import { BASE_CLASS, BASE_CLASS_DETAILS, MAX_TRANSACTIONS_DATE_RANGE_MONTHS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS } from './constants';
import { mediaQueries, useResponsiveViewport } from '../../../../../hooks/useResponsiveViewport';
import { useCustomColumnsData } from '../../../../../hooks/useCustomColumnsData';
import mergeRecords from '../../../../utils/customData/mergeRecords';
import './TransactionsOverview.scss';

export const TransactionsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onRecordSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    columns,
    onDataRetrieved,
}: ExternalUIComponentProps<
    TransactionOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const { getTransactions: transactionsEndpointCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('transactions', activeBalanceAccount);

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
            updateFilters,
        },
        availableCurrencies
    );

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

    const isNarrowViewport = useResponsiveViewport(mediaQueries.down.sm);

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

    const { customRecords: transactions, loadingCustomRecords } = useCustomColumnsData<ITransaction>({
        records,
        onDataRetrieved,
        mergeCustomData,
    });
    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const getExtraFieldsById = useCallback(
        ({ id }: { id: string }) => {
            const record = records.find(r => r.id === id);
            const retrievedItem = transactions.find(item => item.id === id) as Record<string, any>;

            if (record && retrievedItem) {
                // Extract fields from 'retrievedItem' that are not in 'record'
                const extraFields = Object.keys(retrievedItem).reduce((acc, key) => {
                    if (!(key in record)) {
                        acc[key] = retrievedItem[key];
                    }
                    return acc;
                }, {} as Partial<CustomDataRetrieved>);
                return extraFields;
            }

            // If no matching 'retrievedItem' or 'record' is found, return null or empty object
            return null;
        },
        [records, transactions]
    );

    const onRowClick = useCallback(
        ({ id }: ITransaction) => {
            updateDetails({
                selection: {
                    type: 'transaction',
                    data: id,
                    balanceAccount: activeBalanceAccount || '',
                    extraDetails: getExtraFieldsById({ id }) ?? EMPTY_OBJECT,
                },
                modalSize: 'small',
            }).callback({ id });
        },
        [activeBalanceAccount, updateDetails, getExtraFieldsById]
    );

    const sinceDate = useMemo(() => {
        const date = new Date(nowTimestamp);
        date.setMonth(date.getMonth() - MAX_TRANSACTIONS_DATE_RANGE_MONTHS);
        return date.toString();
    }, [nowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="transactionsOverviewTitle">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <FilterBar {...filterBarState}>
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
                    updateFilters={updateFilters}
                />
                {/* Remove status filter temporarily */}
                {/* <MultiSelectionFilter {...statusesFilter} placeholder={i18n.get('filterPlaceholder.status')} /> */}
                <MultiSelectionFilter {...categoriesFilter} placeholder={i18n.get('filterPlaceholder.category')} />
                <AmountFilter
                    availableCurrencies={availableCurrencies}
                    selectedCurrencies={listFrom(filters[FilterParam.CURRENCIES])}
                    name={'range'}
                    label={i18n.get('amount')}
                    minAmount={filters[FilterParam.MIN_AMOUNT]}
                    maxAmount={filters[FilterParam.MAX_AMOUNT]}
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
                        createdUntil={filters[FilterParam.CREATED_UNTIL]!}
                        createdSince={filters[FilterParam.CREATED_SINCE]!}
                        currencies={currenciesFilter.selection}
                        minAmount={filters[FilterParam.MIN_AMOUNT] ? parseFloat(filters[FilterParam.MIN_AMOUNT]) : undefined}
                        maxAmount={filters[FilterParam.MAX_AMOUNT] ? parseFloat(filters[FilterParam.MAX_AMOUNT]) : undefined}
                        fullWidth={isNarrowViewport}
                    />
                </div>
                <div className={SUMMARY_ITEM_CLASS}>
                    <Balances
                        balanceAccountId={activeBalanceAccount?.id}
                        onCurrenciesChange={handleCurrenciesChange}
                        defaultCurrencyCode={activeBalanceAccount?.defaultCurrencyCode}
                        fullWidth={isNarrowViewport}
                    />
                </div>
            </div>

            <DataDetailsModal
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
                    transactions={onDataRetrieved ? transactions : records}
                    customColumns={columns}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
