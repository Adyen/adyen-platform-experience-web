import { ref, computed, watch } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { IReport } from '@integration-components/types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';
import type { ReportsListResponse } from '../types';

interface UseReportsListProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    createdSince: string;
    createdUntil: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
}

export function useReportsList(props: () => UseReportsListProps) {
    const config = useConfigContext();

    const records = ref<IReport[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const fetching = ref(false);
    const limit = ref(props().preferredLimit ?? DEFAULT_PAGE_LIMIT);
    const cursor = ref<string | undefined>(undefined);
    const prevCursor = ref<string | undefined>(undefined);
    const hasNext = ref(false);
    const hasPrevious = ref(false);
    const page = ref(0);
    let abortController: AbortController | null = null;
    let isPaginating = false;
    let pendingFetchAfterPaginate = false;

    const getReports = computed(() => config.endpoints.getReports);
    const canFetch = computed(() => isFunction(getReports.value) && props().fetchEnabled);
    const limitOptions = computed(() => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined));

    async function fetchReports(requestCursor?: string) {
        const fn = getReports.value;
        if (!isFunction(fn) || !canFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;

        try {
            const { balanceAccountId, createdSince, createdUntil } = props();
            const query: NonNullable<Parameters<NonNullable<typeof config.endpoints.getReports>>[1]>['query'] = {
                limit: limit.value,
                type: 'payout',
                balanceAccountId: balanceAccountId ?? '',
                createdSince,
                createdUntil,
            };
            if (requestCursor) query.cursor = requestCursor;

            const json: ReportsListResponse = await fn({ signal }, { query });
            if (!signal.aborted) {
                records.value = json?.data;
                hasNext.value = !!json?._links?.next?.cursor;
                hasPrevious.value = !!json?._links?.prev?.cursor;
                cursor.value = json?._links?.next?.cursor;
                prevCursor.value = json?._links?.prev?.cursor;

                // Notify filter changes
                const { onFiltersChanged } = props();
                if (isFunction(onFiltersChanged)) {
                    onFiltersChanged({
                        balanceAccountId,
                        createdSince,
                        createdUntil,
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
            if (pendingFetchAfterPaginate && !signal.aborted) {
                pendingFetchAfterPaginate = false;
                page.value = 0;
                cursor.value = undefined;
                prevCursor.value = undefined;
                fetchReports();
            }
        }
    }

    const goToNextPage = () => {
        if (hasNext.value && cursor.value) {
            isPaginating = true;
            page.value++;
            fetchReports(cursor.value);
        }
    };

    const goToPreviousPage = () => {
        if (hasPrevious.value && prevCursor.value) {
            isPaginating = true;
            page.value--;
            fetchReports(prevCursor.value);
        }
    };

    const updateLimit = (newLimit: number) => {
        limit.value = newLimit;
        page.value = 0;
        cursor.value = undefined;
        prevCursor.value = undefined;
        fetchReports();
    };

    // Stable key that changes when filter params change
    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        const { balanceAccountId, createdSince, createdUntil } = props();
        return JSON.stringify({ balanceAccountId, createdSince, createdUntil });
    });

    // Single watcher for initial fetch and filter changes
    watch(
        fetchKey,
        (newKey: string | null, oldKey: string | null | undefined) => {
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
            fetchReports();
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
    };
}
