import { TransactionsTable } from '@src/components/external/TransactionsOverview/components/TransactionsTable/TransactionsTable';
import useBalanceAccountSelection from '@src/components/hooks/useBalanceAccountSelection';
import BalanceAccountSelector from '@src/components/internal/FormFields/Select/BalanceAccountSelector';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter/DateFilter';
import FilterBar from '@src/components/internal/FilterBar';
import { ExternalUIComponentProps } from '@src/components/types';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import { lazy } from 'preact/compat';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction, DataOverviewComponentProps, FilterParam } from '@src/types';
import { isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import TransactionTotals from '@src/components/external/TransactionsOverview/components/TransactionTotals/TransactionTotals';
import { Balances } from '@src/components/external/TransactionsOverview/components/Balances/Balances';
import MultiSelectionFilter, { listFrom } from '../MultiSelectionFilter';
import useDefaultOverviewFilterParams from '@src/components/hooks/useDefaultOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { AmountFilter } from '@src/components/internal/FilterBar/filters/AmountFilter/AmountFilter';
import {
    BASE_CLASS,
    BASE_CLASS_DISPLAY,
    SUMMARY_CLASS,
    SUMMARY_ITEM_CLASS,
} from '@src/components/external/TransactionsOverview/components/TransactionsOverview/constants';
import './TransactionsOverview.scss';
import { mediaQueries, useMediaQuery } from '@src/components/external/TransactionsOverview/hooks/useMediaQuery';
import { DataDetailsModal } from '@src/components/internal/DataOverviewDisplay/DataDetailsModal';
const ModalContent = lazy(() => import('@src/components/internal/Modal/ModalContent/ModalContent'));

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
            const requestOptions: SetupHttpOptions = { signal, errorLevel: 'error' };

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
        useCursorPaginatedRecords<ITransaction, 'transactions', string, FilterParam>({
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

    const isNarrowViewport = useMediaQuery(mediaQueries.down.sm);

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
                renderModalContent={() => <ModalContent data={selectedDetail?.selection.data} />}
                className={BASE_CLASS_DISPLAY}
            >
                <TransactionsTable
                    balanceAccounts={balanceAccounts}
                    availableCurrencies={availableCurrencies}
                    error={error as AdyenPlatformExperienceError}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                    onContactSupport={onContactSupport}
                    onRowClick={onRowClick}
                    onTransactionSelected={onRecordSelection}
                    showPagination={true}
                    transactions={records}
                    limit={limit}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
