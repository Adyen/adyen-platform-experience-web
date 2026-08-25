import { computed, watch } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import { useCustomColumnsData } from '@integration-components/composables-vue';
import { isFunction, normalizeCustomFields, hasCustomField, mergeRecords } from '@integration-components/utils';
import { TRANSACTION_FIELDS, TRANSACTION_FIELDS_REMAPS } from '@integration-components/transactions/domain';
import type { ITransaction, CustomDataRetrieved } from '@integration-components/types';
import type { TransactionsFilters, TransactionsListCustomization, TransactionsListResponse } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';

interface UseTransactionsListProps {
    filters: TransactionsFilters;
    fetchEnabled: boolean;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    dataCustomization?: { list?: TransactionsListCustomization };
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
}

export function useTransactionsList(props: () => UseTransactionsListProps) {
    const config = useConfigContext();
    const getTransactions = computed(() => config.endpoints.getTransactions);
    const canFetch = computed(() => isFunction(getTransactions.value) && props().fetchEnabled);
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
        newKey => {
            if (!newKey) return;

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
            const fn = getTransactions.value;
            if (!isFunction(fn)) return { records: undefined };

            const { filters } = props();

            const query: Parameters<NonNullable<typeof config.endpoints.getTransactions>>[1]['query'] = {
                limit,
                balanceAccountId: filters.balanceAccountId ?? '',
                createdSince: filters.createdSince,
                createdUntil: filters.createdUntil,
                sortDirection: 'desc' as const,
                ...(cursor ? { cursor } : {}),
            };

            if (filters.categories.length) (query as any).categories = filters.categories;
            if (filters.currencies.length) (query as any).currencies = filters.currencies;
            if (filters.statuses.length) (query as any).statuses = filters.statuses;
            if (filters.paymentPspReference) query.paymentPspReference = filters.paymentPspReference;

            const json = (await fn({ signal }, { query })) as TransactionsListResponse;

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
