import { ref, computed, watch, toRaw } from 'vue';
import { useConfigContext } from '../../../core/ConfigContext';
import { getTransactionsFilterParams, getTransactionsFilterQueryParams, isFunction } from '../utils';
import type { ITransaction, TransactionsFilters } from '../types';

export interface UseTransactionsListProps {
    fetchEnabled: boolean;
    filters: Readonly<TransactionsFilters>;
    now: number;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onFiltersChanged?: (...args: any[]) => void;
    dataCustomization?: {
        list?: {
            fields?: any[];
            onDataRetrieve?: (data: any) => Promise<any[]> | any[];
        };
    };
}

const DEFAULT_PAGE_LIMIT = 10;
const LIMIT_OPTIONS = [5, 10, 20, 50];

export function useTransactionsList(props: () => UseTransactionsListProps) {
    const { endpoints } = useConfigContext();

    const records = ref<ITransaction[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const fetching = ref(false);
    const limit = ref(props().preferredLimit ?? DEFAULT_PAGE_LIMIT);
    const cursor = ref<string | undefined>(undefined);
    const prevCursor = ref<string | undefined>(undefined);
    const hasNext = ref(false);
    const hasPrevious = ref(false);
    const page = ref(0);
    let abortController: AbortController | null = null;
    // Guard: when true, the filter-change watcher will not trigger a re-fetch
    // because a pagination fetch is already in progress.
    let isPaginating = false;

    const getTransactions = computed(() => endpoints.getTransactions);

    // Only track the two values canFetch actually needs — avoid calling props()
    // which would over-track every reactive value in the parent closure.
    const canFetch = computed(() => isFunction(getTransactions.value) && props().fetchEnabled);

    const limitOptions = computed(() => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined));

    async function fetchTransactions(requestCursor?: string) {
        const fn = getTransactions.value;
        if (!isFunction(fn) || !canFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;

        try {
            const { filters, now } = props();
            const filterParams = getTransactionsFilterQueryParams(toRaw(filters), now);
            const query: Record<string, string | string[]> = {
                limit: String(limit.value),
                sortDirection: 'desc',
                balanceAccountId: filterParams.balanceAccountId,
                createdSince: filterParams.createdSince,
                createdUntil: filterParams.createdUntil,
            };
            if (requestCursor) query.cursor = requestCursor;
            if (filterParams.categories.length) query.categories = filterParams.categories;
            if (filterParams.currencies.length) query.currencies = filterParams.currencies;
            if (filterParams.statuses.length) query.statuses = filterParams.statuses;
            if (filterParams.paymentPspReference) query.paymentPspReference = filterParams.paymentPspReference;

            const json = await fn({ signal }, { query });
            if (!signal.aborted) {
                records.value = json?.data;
                hasNext.value = !!json?._links?.next?.cursor;
                hasPrevious.value = !!json?._links?.prev?.cursor;

                if (json?._links?.next?.cursor) {
                    cursor.value = json._links.next.cursor;
                } else {
                    cursor.value = undefined;
                }
                if (json?._links?.prev?.cursor) {
                    prevCursor.value = json._links.prev.cursor;
                } else {
                    prevCursor.value = undefined;
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
        fetchTransactions();
    };

    // Stable key that only changes when actual filter params or fetch-ability change.
    // We use toRaw() to prevent getDateRangeTimestamps (called inside
    // getTransactionsFilterParams) from mutating reactive state through Vue's proxy,
    // which would dirty this computed on every evaluation.
    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        return JSON.stringify(getTransactionsFilterParams(toRaw(props().filters), props().now));
    });

    // Single watcher for both initial fetch and filter changes.
    // Skipped when a pagination fetch (goToNextPage/goToPreviousPage) is active
    // to avoid resetting cursor and re-fetching without it.
    watch(
        fetchKey,
        (newKey, oldKey) => {
            if (!newKey) return;
            if (isPaginating) return;
            if (oldKey !== null) {
                // Filters changed — reset pagination
                page.value = 0;
                cursor.value = undefined;
                prevCursor.value = undefined;
            }
            fetchTransactions();
        },
        { immediate: true }
    );

    return {
        error,
        fetching,
        records,
        page,
        limit,
        limitOptions,
        hasNext,
        hasPrevious,
        goToNextPage,
        goToPreviousPage,
        updateLimit,
        fields: computed(() => props().dataCustomization?.list?.fields),
        hasCustomColumn: computed(() => false), // Simplified: custom columns not yet supported
    };
}

export default useTransactionsList;
