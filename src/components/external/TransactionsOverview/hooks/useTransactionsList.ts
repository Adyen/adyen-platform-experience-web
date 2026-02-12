import { isFunction } from '../../../../utils';
import { ITransaction } from '../../../../types';
import { TransactionsFilters } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../internal/Pagination/constants';
import { TRANSACTION_FIELDS, TRANSACTION_FIELDS_REMAPS } from '../components/TransactionsTable/TransactionsTable';
import { getTransactionsFilterParams, getTransactionsFilterQueryParams } from '../components/utils';
import { CustomDataRetrieved, TransactionOverviewComponentProps } from '../../../types';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { useCustomColumnsData } from '../../../../hooks/useCustomColumnsData';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import normalizeCustomFields from '../../../utils/customData/normalizeCustomFields';
import hasCustomField from '../../../utils/customData/hasCustomField';
import mergeRecords from '../../../utils/customData/mergeRecords';

export interface UseTransactionsListProps
    extends Pick<TransactionOverviewComponentProps, 'allowLimitSelection' | 'dataCustomization' | 'onFiltersChanged' | 'preferredLimit'> {
    fetchEnabled: boolean;
    filters: Readonly<TransactionsFilters>;
    now: number;
}

const useTransactionsList = ({
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    dataCustomization,
    fetchEnabled,
    filters,
    now,
    onFiltersChanged,
}: UseTransactionsListProps) => {
    const { getTransactions } = useConfigContext().endpoints;

    const filterParams = useMemo(() => getTransactionsFilterParams(filters, now), [filters, now]);
    const initialFilterParams = useRef(filterParams).current;
    const cachedFilterParams = useRef(initialFilterParams);
    const canFetchTransactions = isFunction(getTransactions) && fetchEnabled;

    const fetchTransactions = useCallback(
        async (requestParams: Pick<Parameters<NonNullable<typeof getTransactions>>[1]['query'], 'limit' | 'cursor'>, signal?: AbortSignal) => {
            const query: Parameters<NonNullable<typeof getTransactions>>[1]['query'] = {
                ...requestParams,
                ...getTransactionsFilterQueryParams(filters, now),
                sortDirection: 'desc' as const,
            } as const;

            return getTransactions!({ signal }, { query });
        },
        [filters, getTransactions, now]
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

    const normalizedFields = useMemo<typeof fields>(() => normalizeCustomFields(fields, TRANSACTION_FIELDS_REMAPS), [fields]);
    const hasCustomColumn = useMemo(() => hasCustomField(normalizedFields, TRANSACTION_FIELDS), [normalizedFields]);
    const { customRecords, loadingCustomRecords } = useCustomColumnsData<ITransaction>({ hasCustomColumn, mergeCustomData, onDataRetrieve, records });

    useEffect(() => {
        if (cachedFilterParams.current !== filterParams) {
            cachedFilterParams.current = filterParams;
            updateFilters?.(filterParams);
        }
    }, [filterParams, updateFilters]);

    return {
        ...paginationProps,
        error,
        fields: normalizedFields,
        fetching: fetching || loadingCustomRecords,
        records: customRecords,
        hasCustomColumn,
        limit,
        limitOptions,
        updateLimit,
    } as const;
};

export default useTransactionsList;
