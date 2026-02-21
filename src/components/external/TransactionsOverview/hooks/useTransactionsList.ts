import { isFunction } from '../../../../utils';
import { ITransaction } from '../../../../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../internal/Pagination/constants';
import { TRANSACTION_FIELDS, TRANSACTION_FIELDS_REMAPS } from '../components/TransactionsTable/TransactionsTable';
import { CustomDataRetrieved, TransactionOverviewComponentProps } from '../../../types';
import { operations } from '../../../../types/api/resources/TransactionsResourceV2';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { useCustomColumnsData } from '../../../../hooks/useCustomColumnsData';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import normalizeCustomFields from '../../../utils/customData/normalizeCustomFields';
import hasCustomField from '../../../utils/customData/hasCustomField';
import mergeRecords from '../../../utils/customData/mergeRecords';

type TransactionsQuery = operations['getTransactions']['parameters']['query'];
type TransactionsFiltersQuery = Omit<TransactionsQuery, 'limit' | 'cursor' | 'sortDirection'>;
type RequiredQueryParams = 'createdSince' | 'createdUntil';
type OptionalQueryParams = Exclude<keyof TransactionsFiltersQuery, RequiredQueryParams>;

export interface UseTransactionsListProps
    extends Pick<TransactionOverviewComponentProps, 'allowLimitSelection' | 'dataCustomization' | 'preferredLimit'> {
    fetchEnabled: boolean;
    filtersLoading: boolean;
    filterParams: { [K in OptionalQueryParams]: string | undefined } & { [K in RequiredQueryParams]: string };
    query: TransactionsFiltersQuery;
}

const useTransactionsList = ({
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    dataCustomization,
    fetchEnabled,
    filtersLoading,
    filterParams,
    query: transactionsQuery,
}: UseTransactionsListProps) => {
    const { getTransactions } = useConfigContext().endpoints;

    const initialFilterParams = useRef(filterParams).current;
    const cachedFilterParams = useRef(initialFilterParams);
    const canFetchTransactions = isFunction(getTransactions) && fetchEnabled;

    const fetchTransactions = useCallback(
        async (requestParams: Pick<TransactionsQuery, 'limit' | 'cursor'>, signal?: AbortSignal) => {
            const query: TransactionsQuery = {
                ...requestParams,
                ...transactionsQuery,
                sortDirection: 'desc' as const,
            } as const;

            return getTransactions!({ signal }, { query });
        },
        [getTransactions, transactionsQuery]
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
        fetching: filtersLoading || fetching || loadingCustomRecords,
        records: customRecords,
        hasCustomColumn,
        limit,
        limitOptions,
        updateLimit,
    } as const;
};

export default useTransactionsList;
