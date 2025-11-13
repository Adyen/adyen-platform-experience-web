import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import { TransactionsTable, TRANSACTION_FIELDS } from '../TransactionsTable/TransactionsTable';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { TransactionOverviewComponentProps, ExternalUIComponentProps, CustomDataRetrieved } from '../../../../types';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { parseCursorPaginatedResponseData } from '../../../../internal/Pagination/hooks/usePaginatedRecords';
import { Header } from '../../../../internal/Header';
import { IBalanceAccountBase, ITransaction } from '../../../../../types';
import { isFunction } from '../../../../../utils';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import { Balances } from '../Balances/Balances';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { BASE_CLASS, BASE_CLASS_DETAILS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS } from './constants';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { useCustomColumnsData } from '../../../../../hooks/useCustomColumnsData';
import hasCustomField from '../../../../utils/customData/hasCustomField';
import mergeRecords from '../../../../utils/customData/mergeRecords';
import './TransactionsOverview.scss';
import usePageLimit from '../../../../internal/Pagination/hooks/usePageLimit';
import useCursorPagination from '../../../../internal/Pagination/hooks/useCursorPagination';
import { useFetch } from '../../../../../hooks/useFetch';
import { RequestPageCallback, RequestPageCallbackParams } from '../../../../internal/Pagination/hooks/types';
import { PaginationType } from '../../../../internal/Pagination/types';
import TransactionsOverviewFilters, { INITIAL_FILTERS } from '../TransactionsOverviewFilters/TransactionsOverviewFilters';

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
    const { getTransactions: transactionsEndpointCall } = useConfigContext().endpoints;
    const userEvents = useAnalyticsContext();

    const cachedFilters = useRef(filters);

    const [availableCurrencies, setAvailableCurrencies] = useState<string[] | undefined>([]);
    const [isAvailableCurrenciesFetching, setIsAvailableCurrenciesFetching] = useState(false);
    const hasMultipleCurrencies = !!availableCurrencies && availableCurrencies.length > 1;

    const handleCurrenciesChange = useCallback((currencies: ITransaction['amount']['currency'][] | undefined, isFetching: boolean) => {
        setAvailableCurrencies(currencies);
        setIsAvailableCurrenciesFetching(isFetching);
    }, []);

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const [preferredPageLimit, setPreferredPageLimit] = useState<number>(preferredLimit);
    const { limit, limitOptions } = usePageLimit({ preferredLimit: preferredPageLimit, preferredLimitOptions });
    const updateLimit = useCallback((limit: number) => setPreferredPageLimit(limit), []);

    useEffect(() => updateLimit(preferredLimit), [preferredLimit, updateLimit]);

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
    const canFetchTransactions = isFunction(transactionsEndpointCall) && !!balanceAccountId;
    const latestRequestTimestamp = useRef<DOMHighResTimeStamp>();
    const latestRequestPromiseResolve = useRef<any>(() => {});

    const latestRequestPromise = useRef(
        new Promise<any>(resolve => {
            latestRequestPromiseResolve.current = resolve;
        })
    );

    const [pageRequestParams, setPageRequestParams] = useState<RequestPageCallbackParams<PaginationType.CURSOR>>();
    const [records, setRecords] = useState<ITransaction[]>([]);

    const {
        data,
        error,
        isFetching: fetching,
    } = useFetch({
        queryFn: useMemo(() => {
            const { cursor, signal } = pageRequestParams ?? {};
            const requestOptions = { errorLevel: 'error', signal } as const;
            const { categories, currencies, createdDate, statuses } = filters;

            const requestQuery = {
                limit,
                cursor,
                balanceAccountId: balanceAccountId ?? '',
                maxAmount: undefined,
                minAmount: undefined,
                sortDirection: 'desc' as const,
                statuses: statuses as (typeof statuses)[number][],
                categories: categories as (typeof categories)[number][],
                currencies: currencies as (typeof currencies)[number][],
                createdSince: new Date(createdDate.from).toISOString(),
                createdUntil: new Date(createdDate.to).toISOString(),
            } as const;

            return async () => {
                if (canFetchTransactions) {
                    const requestTimestamp = performance.now();
                    latestRequestTimestamp.current = requestTimestamp;
                    try {
                        const json = await transactionsEndpointCall(requestOptions, { query: requestQuery });

                        if (latestRequestTimestamp.current === requestTimestamp && !signal?.aborted) {
                            return parseCursorPaginatedResponseData<ITransaction, 'data'>(json, 'data');
                        }
                    } catch (error) {
                        if (latestRequestTimestamp.current === requestTimestamp && !signal?.aborted) {
                            console.error(error);
                            throw error;
                        }
                    }
                }
            };
        }, [canFetchTransactions, transactionsEndpointCall, balanceAccountId, filters, limit, pageRequestParams]),
        fetchOptions: { enabled: canFetchTransactions },
    });

    useEffect(() => {
        if (data) {
            const { records, paginationData } = data;
            latestRequestPromiseResolve.current({ ...paginationData, size: records.length });
            setRecords(records);
        }
    }, [data]);

    const {
        goto,
        limit: _,
        ...paginationProps
    } = useCursorPagination(
        useCallback<RequestPageCallback<PaginationType.CURSOR>>(async pageRequestParams => {
            setPageRequestParams(pageRequestParams);
            return latestRequestPromise.current;
        }, []),
        limit
    );

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
                    balanceAccount: filters.balanceAccount,
                },
                modalSize: 'small',
            }).callback({ id });
        },
        [filters.balanceAccount, updateDetails, userEvents]
    );

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <TransactionsOverviewFilters
                {...filterBarState}
                availableCurrencies={availableCurrencies}
                balanceAccounts={balanceAccounts}
                eventCategory="Transaction component"
                onChange={setFilters}
            />
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
                <div className={SUMMARY_ITEM_CLASS}>
                    <Balances balanceAccount={filters.balanceAccount} onCurrenciesChange={handleCurrenciesChange} fullWidth={isNarrowContainer} />
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
                    activeBalanceAccount={filters.balanceAccount}
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
