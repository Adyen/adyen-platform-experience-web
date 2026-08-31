import { computed, watch } from 'vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import { useCustomColumnsData } from '@integration-components/composables-vue';
import { isFunction, normalizeCustomFields, hasCustomField, mergeRecords } from '@integration-components/utils';
import { TRANSACTION_FIELDS, TRANSACTION_FIELDS_REMAPS } from '@integration-components/transactions/domain';
import type { ITransaction, CustomDataRetrieved } from '@integration-components/types';
import type { TransactionsFilters, TransactionsListCustomization, TransactionsListResponse } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';
import { useTransactionsContext } from '../../integration/context';

interface UseTransactionsListProps {
    filters: TransactionsFilters;
    fetchEnabled: boolean;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    dataCustomization?: { list?: TransactionsListCustomization };
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
}

export function useTransactionsList(props: () => UseTransactionsListProps) {
    const { runtime } = useTransactionsContext();
    const canFetch = computed(() => runtime.available === true && props().fetchEnabled);
    const normalizedFields = computed(() => normalizeCustomFields(props().dataCustomization?.list?.fields, TRANSACTION_FIELDS_REMAPS));
    const hasCustomColumn = computed(() => hasCustomField(normalizedFields.value, TRANSACTION_FIELDS));

    const mergeCustomData = ({ records, retrievedData }: { records: ITransaction[]; retrievedData: CustomDataRetrieved[] }) =>
        mergeRecords(records, retrievedData, (mod, rec) => mod.id === rec.id);

    const getFiltersKey = () => {
        const { filters } = props();

        return JSON.stringify({
            balanceAccountId: filters.balanceAccountId,
            createdSince: filters.createdSince,
            createdUntil: filters.createdUntil,
            categories: [...filters.categories].sort().join(','),
            currencies: [...filters.currencies].sort().join(','),
            statuses: [...filters.statuses].sort().join(','),
            paymentPspReference: filters.paymentPspReference,
        });
    };

    const getFetchKey = () => (canFetch.value ? getFiltersKey() : null);

    watch(
        getFiltersKey,
        () => {
            const { onFiltersChanged, filters } = props();

            if (isFunction(onFiltersChanged)) {
                onFiltersChanged({
                    balanceAccountId: filters.balanceAccountId,
                    createdSince: filters.createdSince,
                    createdUntil: filters.createdUntil,
                    categories: filters.categories.join(',') || undefined,
                    currencies: filters.currencies.join(',') || undefined,
                    statuses: filters.statuses.join(',') || undefined,
                    paymentPspReference: filters.paymentPspReference,
                });
            }
        },
        { immediate: true }
    );

    const pagination = useCursorPaginatedRecords<ITransaction>({
        getFetchKey,
        fetchPage: async ({ cursor, limit, signal }) => {
            const { filters } = props();
            const json = (await runtime.getTransactions({
                ...filters,
                balanceAccountId: filters.balanceAccountId ?? '',
                cursor,
                limit,
                signal,
                sortDirection: 'desc',
            })) as TransactionsListResponse;

            return {
                records: json?.data,
                nextCursor: json?._links?.next?.cursor,
                previousCursor: json?._links?.prev?.cursor,
            };
        },
        preferredLimit: props().preferredLimit ?? DEFAULT_PAGE_LIMIT,
        limitOptions: () => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined),
    });

    const { customRecords, loadingCustomRecords } = useCustomColumnsData<ITransaction>({
        records: () => pagination.records.value ?? [],
        hasCustomColumn: () => hasCustomColumn.value,
        onDataRetrieve: () => props().dataCustomization?.list?.onDataRetrieve,
        mergeCustomData,
    });

    return {
        error: pagination.error,
        fetching: computed(() => pagination.fetching.value || loadingCustomRecords.value),
        records: customRecords,
        fields: normalizedFields,
        hasCustomColumn,
        page: pagination.page,
        hasFetchedOnce: pagination.hasFetchedOnce,
        limit: pagination.limit,
        limitOptions: pagination.limitOptions,
        hasNext: pagination.hasNext,
        hasPrevious: pagination.hasPrevious,
        goToNextPage: pagination.goToNextPage,
        goToPreviousPage: pagination.goToPreviousPage,
        updateLimit: pagination.updateLimit,
    } as const;
}
