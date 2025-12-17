import { isFunction } from '../../../../utils';
import { ITransaction } from '../../../../types';
import { TransactionsFilters } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../internal/Pagination/constants';
import { TRANSACTION_FIELDS } from '../components/TransactionsTable/TransactionsTable';
import { CustomDataRetrieved, TransactionOverviewComponentProps } from '../../../types';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { useCustomColumnsData } from '../../../../hooks/useCustomColumnsData';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import hasCustomField from '../../../utils/customData/hasCustomField';
import mergeRecords from '../../../utils/customData/mergeRecords';

export interface UseTransactionsListProps
    extends Pick<TransactionOverviewComponentProps, 'allowLimitSelection' | 'dataCustomization' | 'onFiltersChanged' | 'preferredLimit'> {
    fetchEnabled: boolean;
    filters: Readonly<TransactionsFilters>;
}

const useTransactionsList = ({
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    dataCustomization,
    fetchEnabled,
    filters,
    onFiltersChanged,
}: UseTransactionsListProps) => {
    const { getTransactions } = useConfigContext().endpoints;

    const filterParams = useMemo(
        () =>
            ({
                balanceAccountId: filters.balanceAccount?.id,
                pspReference: filters.pspReference,
                statuses: String(filters.statuses) || undefined,
                categories: String(filters.categories) || undefined,
                currencies: String(filters.currencies) || undefined,
                createdSince: new Date(filters.createdDate.from).toISOString(),
                createdUntil: new Date(filters.createdDate.to).toISOString(),
            }) as const,
        [filters]
    );

    const initialFilterParams = useRef(filterParams).current;
    const cachedFilterParams = useRef(initialFilterParams);
    const canFetchTransactions = isFunction(getTransactions) && fetchEnabled;

    const fetchTransactions = useCallback(
        async (requestParams: Pick<Parameters<NonNullable<typeof getTransactions>>[1]['query'], 'limit' | 'cursor'>, signal?: AbortSignal) => {
            const query: Parameters<NonNullable<typeof getTransactions>>[1]['query'] = {
                ...requestParams,
                balanceAccountId: filters.balanceAccount?.id!,
                pspReference: filters.pspReference,
                createdSince: new Date(filters.createdDate.from).toISOString(),
                createdUntil: new Date(filters.createdDate.to).toISOString(),
                categories: filters.categories as (typeof filters.categories)[number][],
                currencies: filters.currencies as (typeof filters.currencies)[number][],
                statuses: filters.statuses as (typeof filters.statuses)[number][],
                sortDirection: 'desc' as const,
            } as const;

            return getTransactions!({ signal }, { query });
        },
        [filters, getTransactions]
    );

    const {
        canResetFilters,
        error,
        fetching,
        filters: _,
        limit,
        limitOptions,
        records,
        resetFilters,
        updateFilters,
        updateLimit,
        ...paginationProps
    } = useCursorPaginatedRecords<ITransaction, 'data', string, keyof typeof filterParams>({
        dataField: 'data',
        fetchRecords: fetchTransactions,
        enabled: canFetchTransactions,
        filterParams: initialFilterParams,
        initialFiltersSameAsDefault: true,
        onFiltersChanged: isFunction(onFiltersChanged) ? onFiltersChanged : void 0,
        preferredLimitOptions: allowLimitSelection ? LIMIT_OPTIONS : undefined,
        preferredLimit,
    });

    const mergeCustomData = useCallback(
        ({ records, retrievedData }: { records: ITransaction[]; retrievedData: CustomDataRetrieved[] }) =>
            mergeRecords(records, retrievedData, (modifiedRecord, record) => modifiedRecord.id === record.id),
        []
    );

    const { fields, onDataRetrieve } = dataCustomization?.list ?? {};
    const hasCustomColumn = useMemo(() => hasCustomField(fields, TRANSACTION_FIELDS), [fields]);
    const { customRecords, loadingCustomRecords } = useCustomColumnsData<ITransaction>({ hasCustomColumn, mergeCustomData, onDataRetrieve, records });

    if (cachedFilterParams.current !== filterParams) {
        cachedFilterParams.current = filterParams;
        updateFilters?.(filterParams);
    }

    return {
        ...paginationProps,
        error,
        fields,
        fetching: fetching || loadingCustomRecords,
        records: customRecords,
        hasCustomColumn,
        limit,
        limitOptions,
        updateLimit,
    } as const;
};

export default useTransactionsList;
