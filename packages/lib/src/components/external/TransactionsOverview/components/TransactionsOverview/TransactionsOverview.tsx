import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import useBalanceAccountSelection from '../../../../hooks/useBalanceAccountSelection';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import FilterBar from '../../../../internal/FilterBar';
import { DataOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useSetupEndpoint } from '../../../../../hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '../../../../../types';
import { isFunction, isUndefined, listFrom } from '../../../../../utils';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import { Balances } from '../Balances/Balances';
import MultiSelectionFilter from '../MultiSelectionFilter';
import useDefaultOverviewFilterParams from '../../../../hooks/useDefaultOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { AmountFilter } from '../../../../internal/FilterBar/filters/AmountFilter/AmountFilter';
import { BASE_CLASS, BASE_CLASS_DETAILS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS } from './constants';
import { mediaQueries, useResponsiveViewport } from '../../hooks/useResponsiveViewport';
import './TransactionsOverview.scss';

export const TransactionsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onRecordSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
}: ExternalUIComponentProps<
    DataOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const transactionsEndpointCall = useSetupEndpoint('getTransactions');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('transactions', activeBalanceAccount);

    const getTransactions = useCallback(
        async ({ balanceAccount, ...pageRequestParams }: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return transactionsEndpointCall(requestOptions, {
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
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'data', string, FilterParam>({
            fetchRecords: getTransactions,
            dataField: 'data',
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

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: ITransaction) => {
            updateDetails({
                selection: { type: 'transaction', data: { ...value, balanceAccountDescription: activeBalanceAccount?.description } },
                modalSize: 'small',
            }).callback({ id: value.id });
        },
        [updateDetails, activeBalanceAccount]
    );

    const sinceDate = useMemo(() => {
        const date = new Date(nowTimestamp);
        date.setMonth(date.getMonth() - 24);
        return date.toString();
    }, [nowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            {!hideTitle && (
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('transactionsOverviewTitle')}
                </Typography>
            )}
            <FilterBar>
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
                    <Balances balanceAccountId={activeBalanceAccount?.id} onCurrenciesChange={handleCurrenciesChange} fullWidth={isNarrowViewport} />
                </div>
            </div>

            <DataDetailsModal
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                className={BASE_CLASS_DETAILS}
            >
                <TransactionsTable
                    balanceAccounts={balanceAccounts}
                    availableCurrencies={availableCurrencies}
                    error={error as AdyenPlatformExperienceError}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    limit={limit}
                    limitOptions={limitOptions}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    onRowClick={onRowClick}
                    onTransactionSelected={onRecordSelection}
                    showPagination={true}
                    transactions={records}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
