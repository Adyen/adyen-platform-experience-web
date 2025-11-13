import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import { TransactionsTable, TRANSACTION_FIELDS } from '../TransactionsTable/TransactionsTable';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { CustomDataRetrieved, ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { parseCursorPaginatedResponseData } from '../../../../internal/Pagination/hooks/usePaginatedRecords';
import { ITransaction } from '../../../../../types';
import { isFunction } from '../../../../../utils';
import { LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { Balances } from '../Balances/Balances';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { BASE_CLASS_DETAILS, SUMMARY_CLASS, SUMMARY_ITEM_CLASS } from '../TransactionsOverview/constants';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { useCustomColumnsData } from '../../../../../hooks/useCustomColumnsData';
import hasCustomField from '../../../../utils/customData/hasCustomField';
import mergeRecords from '../../../../utils/customData/mergeRecords';
import usePageLimit from '../../../../internal/Pagination/hooks/usePageLimit';
import useCursorPagination from '../../../../internal/Pagination/hooks/useCursorPagination';
import { useFetch } from '../../../../../hooks/useFetch';
import { TransactionsOverviewFilters } from '../TransactionsOverviewFilters/types';
import { RequestPageCallback, RequestPageCallbackParams } from '../../../../internal/Pagination/hooks/types';
import { PaginationType } from '../../../../internal/Pagination/types';

const TransactionsList = ({
    allowLimitSelection,
    availableCurrencies,
    dataCustomization,
    filters,
    loadingBalanceAccounts,
    onContactSupport,
    onCurrenciesChange,
    onRecordSelection,
    preferredLimit,
    showDetails,
}: ExternalUIComponentProps<TransactionOverviewComponentProps> & {
    availableCurrencies?: string[];
    filters: Readonly<TransactionsOverviewFilters>;
    loadingBalanceAccounts: boolean;
    onCurrenciesChange: (currencies: string[] | undefined, isFetching: boolean) => void;
    preferredLimit: number;
}) => {
    const { getTransactions: transactionsEndpointCall } = useConfigContext().endpoints;
    const userEvents = useAnalyticsContext();

    const balanceAccount = filters.balanceAccount;
    const balanceAccountId = balanceAccount?.id;
    const hasMultipleCurrencies = !!availableCurrencies && availableCurrencies.length > 1;

    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const [preferredPageLimit, setPreferredPageLimit] = useState<number>(preferredLimit);
    const { limit, limitOptions } = usePageLimit({ preferredLimit: preferredPageLimit, preferredLimitOptions });
    const updateLimit = useCallback((limit: number) => setPreferredPageLimit(limit), []);

    useEffect(() => updateLimit(preferredLimit), [preferredLimit, updateLimit]);

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
                    balanceAccount,
                },
                modalSize: 'small',
            }).callback({ id });
        },
        [balanceAccount, updateDetails, userEvents]
    );

    return (
        <>
            <div className={SUMMARY_CLASS}>
                <div className={SUMMARY_ITEM_CLASS}>
                    <Balances balanceAccount={balanceAccount} onCurrenciesChange={onCurrenciesChange} fullWidth={isNarrowContainer} />
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
                    activeBalanceAccount={balanceAccount}
                    availableCurrencies={availableCurrencies}
                    error={error as AdyenPlatformExperienceError}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    limit={limit}
                    limitOptions={limitOptions}
                    loading={fetching || loadingBalanceAccounts || loadingCustomRecords}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    onRowClick={onRowClick}
                    showPagination={true}
                    transactions={dataCustomization?.list?.onDataRetrieve ? transactions : records}
                    customColumns={dataCustomization?.list?.fields}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </>
    );
};

export default TransactionsList;
