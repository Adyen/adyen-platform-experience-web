import { ref, computed, watch, onUnmounted } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
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

    const records = ref<ITransaction[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const fetching = ref(false);
    const limit = ref(props().preferredLimit ?? DEFAULT_PAGE_LIMIT);
    const cursor = ref<string | undefined>(undefined);
    const prevCursor = ref<string | undefined>(undefined);
    const hasNext = ref(false);
    const hasPrevious = ref(false);
    const page = ref(0);
    const hasFetchedOnce = ref(false);

    let abortController: AbortController | null = null;
    let isPaginating = false;
    let pendingFetchAfterPaginate = false;

    const getTransactions = computed(() => config.endpoints.getTransactions);
    const canFetch = computed(() => isFunction(getTransactions.value) && props().fetchEnabled);
    const limitOptions = computed(() => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined));

    const normalizedFields = computed(() => normalizeCustomFields(props().dataCustomization?.list?.fields, TRANSACTION_FIELDS_REMAPS));
    const hasCustomColumn = computed(() => hasCustomField(normalizedFields.value, TRANSACTION_FIELDS));

    const mergeCustomData = ({ records, retrievedData }: { records: ITransaction[]; retrievedData: CustomDataRetrieved[] }) =>
        mergeRecords(records, retrievedData, (mod, rec) => mod.id === rec.id);

    const { customRecords, loadingCustomRecords } = useCustomColumnsData<ITransaction>({
        records: () => records.value ?? [],
        hasCustomColumn: () => hasCustomColumn.value,
        onDataRetrieve: () => props().dataCustomization?.list?.onDataRetrieve,
        mergeCustomData,
    });

    async function fetchTransactions(requestCursor?: string) {
        const fn = getTransactions.value;
        if (!isFunction(fn) || !canFetch.value) return;

        pendingFetchAfterPaginate = false;
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;

        try {
            const { filters } = props();
            const query: Parameters<NonNullable<typeof config.endpoints.getTransactions>>[1]['query'] = {
                limit: limit.value,
                balanceAccountId: filters.balanceAccountId ?? '',
                createdSince: filters.createdSince,
                createdUntil: filters.createdUntil,
                sortDirection: 'desc' as const,
            };
            if (filters.categories.length) (query as any).categories = filters.categories;
            if (filters.currencies.length) (query as any).currencies = filters.currencies;
            if (filters.statuses.length) (query as any).statuses = filters.statuses;
            if (filters.paymentPspReference) query.paymentPspReference = filters.paymentPspReference;
            if (requestCursor) query.cursor = requestCursor;

            const json = (await fn({ signal }, { query })) as TransactionsListResponse;
            if (!signal.aborted) {
                hasFetchedOnce.value = true;
                records.value = json?.data;
                hasNext.value = !!json?._links?.next?.cursor;
                hasPrevious.value = !!json?._links?.prev?.cursor;
                cursor.value = json?._links?.next?.cursor;
                prevCursor.value = json?._links?.prev?.cursor;

                const { onFiltersChanged } = props();
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
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
            }
        } finally {
            if (!signal.aborted) {
                fetching.value = false;
            }
            isPaginating = false;
            if (pendingFetchAfterPaginate && !abortController?.signal.aborted) {
                pendingFetchAfterPaginate = false;
                page.value = 0;
                cursor.value = undefined;
                prevCursor.value = undefined;
                fetchTransactions();
            }
        }
    }

    const goToNextPage = () => {
        if (hasNext.value && cursor.value) {
            isPaginating = true;
            page.value++;
            fetchTransactions(cursor.value);
        }
    };

    const goToPreviousPage = () => {
        if (hasPrevious.value && prevCursor.value) {
            isPaginating = true;
            page.value--;
            fetchTransactions(prevCursor.value);
        }
    };

    const updateLimit = (newLimit: number) => {
        limit.value = newLimit;
        page.value = 0;
        cursor.value = undefined;
        prevCursor.value = undefined;
    };

    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        const { filters } = props();
        return JSON.stringify({
            balanceAccountId: filters.balanceAccountId,
            createdSince: filters.createdSince,
            createdUntil: filters.createdUntil,
            categories: [...filters.categories].sort().join(','),
            currencies: [...filters.currencies].sort().join(','),
            statuses: [...filters.statuses].sort().join(','),
            paymentPspReference: filters.paymentPspReference,
            limit: limit.value,
        });
    });

    watch(
        fetchKey,
        (newKey, oldKey) => {
            if (!newKey) return;
            if (isPaginating) {
                pendingFetchAfterPaginate = true;
                return;
            }
            if (oldKey !== null && oldKey !== undefined) {
                page.value = 0;
                cursor.value = undefined;
                prevCursor.value = undefined;
            }
            fetchTransactions();
        },
        { immediate: true }
    );

    onUnmounted(() => abortController?.abort());

    return {
        error,
        fetching: computed(() => fetching.value || loadingCustomRecords.value),
        records: customRecords,
        fields: normalizedFields,
        hasCustomColumn,
        page,
        hasFetchedOnce,
        limit,
        limitOptions,
        hasNext,
        hasPrevious,
        goToNextPage,
        goToPreviousPage,
        updateLimit,
    } as const;
}
