import { isFunction, hasCustomField, listFrom, mergeRecords, normalizeCustomFields } from '@integration-components/utils';
import { ITransaction, CustomDataRetrieved } from '@integration-components/types';
import { TransactionsFilters } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@integration-components/ui-components-preact/Pagination/constants';
import { TRANSACTION_FIELDS, TRANSACTION_FIELDS_REMAPS } from '../../../../domain/src';
import { getTransactionsFilterParams } from '../components/utils';
import type { TransactionsOverviewComponentProps } from '../types';
import { useCursorPaginatedRecords } from '@integration-components/ui-components-preact/Pagination/hooks';
import { useCustomColumnsData } from '@integration-components/hooks-preact';
import { useConfigContext } from '@integration-components/core/preact';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';

export interface UseTransactionsListProps
    extends Pick<TransactionsOverviewComponentProps, 'allowLimitSelection' | 'dataCustomization' | 'onFiltersChanged' | 'preferredLimit'> {
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
    const activeFilterParamsRef = useRef(filterParams);
    const canFetchTransactions = isFunction(getTransactions) && fetchEnabled;

    useEffect(() => {
        activeFilterParamsRef.current = filterParams;
    }, [filterParams]);

    const fetchTransactions = useCallback(
        async (paginationParams: typeof filterParams & { cursor?: string; limit: number }, signal?: AbortSignal) => {
            type TransactionsQuery = Parameters<NonNullable<typeof getTransactions>>[1]['query'];
            const activeFilterParams = activeFilterParamsRef.current;
            const hasCurrentFilterParams = (Object.keys(activeFilterParams) as (keyof typeof activeFilterParams)[]).every(
                key => paginationParams[key] === activeFilterParams[key]
            );
            const { categories, currencies, statuses, ...requestParams } = hasCurrentFilterParams
                ? paginationParams
                : { ...activeFilterParams, limit: paginationParams.limit };
            const query: TransactionsQuery = {
                ...requestParams,
                balanceAccountId: requestParams.balanceAccountId as string,
                categories: listFrom(categories) as TransactionsQuery['categories'],
                currencies: listFrom(currencies) as TransactionsQuery['currencies'],
                statuses: listFrom(statuses) as TransactionsQuery['statuses'],
                sortDirection: 'desc',
            };

            return getTransactions!({ signal }, { query });
        },
        [getTransactions]
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
        filterParams,
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
