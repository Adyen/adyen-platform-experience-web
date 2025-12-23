import { isFunction } from '../../../../utils';
import { ITransaction } from '../../../../types';
import { TransactionsFilters } from '../types';
import { getTransactionsFilterParams, getTransactionsFilterQueryParams } from '../components/utils';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../internal/Pagination/constants';
import { TRANSACTION_FIELDS } from '../components/TransactionsTable/TransactionsTable';
import { CustomDataRetrieved, TransactionOverviewComponentProps } from '../../../types';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { useCustomColumnsData } from '../../../../hooks/useCustomColumnsData';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
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

    const filterParams = useMemo(() => getTransactionsFilterParams(filters), [filters]);
    const initialFilterParams = useRef(filterParams).current;
    const cachedFilterParams = useRef(initialFilterParams);
    const canFetchTransactions = isFunction(getTransactions) && fetchEnabled;

    const fetchTransactions = useCallback(
        async (requestParams: Pick<Parameters<NonNullable<typeof getTransactions>>[1]['query'], 'limit' | 'cursor'>, signal?: AbortSignal) => {
            const query: Parameters<NonNullable<typeof getTransactions>>[1]['query'] = {
                ...requestParams,
                ...getTransactionsFilterQueryParams(filters),
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

    useEffect(() => {
        if (cachedFilterParams.current !== filterParams) {
            cachedFilterParams.current = filterParams;
            updateFilters?.(filterParams);
        }
    }, [filterParams, updateFilters]);

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
