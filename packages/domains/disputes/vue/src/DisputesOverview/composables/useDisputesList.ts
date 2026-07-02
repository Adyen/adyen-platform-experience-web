import { ref, computed, watch } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction, listFrom } from '@integration-components/utils';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';

interface UseDisputesListProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    statusGroup: IDisputeStatusGroup;
    reasonCategories: string | undefined;
    schemeCodes: string | undefined;
    createdSince: string | undefined;
    createdUntil: string | undefined;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    refreshToken?: number;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
}

export function useDisputesList(props: () => UseDisputesListProps) {
    const config = useConfigContext();

    const records = ref<IDisputeListItem[] | undefined>(undefined);
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

    const getDisputeList = computed(() => config.endpoints.getDisputeList);
    const canFetch = computed(() => isFunction(getDisputeList.value) && props().fetchEnabled);
    const limitOptions = computed(() => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined));

    async function fetchDisputes(requestCursor?: string) {
        const fn = getDisputeList.value;
        if (!isFunction(fn) || !canFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;

        try {
            const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil } = props();
            const query: NonNullable<Parameters<NonNullable<typeof config.endpoints.getDisputeList>>[1]>['query'] = {
                statusGroup,
                limit: limit.value,
                ...(balanceAccountId ? { balanceAccountId } : {}),
                reasonCategories: listFrom(reasonCategories) as NonNullable<typeof query.reasonCategories>,
                schemeCodes: listFrom(schemeCodes) as NonNullable<typeof query.schemeCodes>,
                ...(createdSince ? { createdSince } : {}),
                ...(createdUntil ? { createdUntil } : {}),
            };
            if (requestCursor) query.cursor = requestCursor;

            const json = await fn({ signal, errorLevel: 'error' }, { query });
            if (!signal.aborted) {
                records.value = json?.data;
                hasNext.value = !!json?._links?.next?.cursor;
                hasPrevious.value = !!json?._links?.prev?.cursor;
                cursor.value = json?._links?.next?.cursor;
                prevCursor.value = json?._links?.prev?.cursor;

                const { onFiltersChanged } = props();
                if (isFunction(onFiltersChanged)) {
                    onFiltersChanged({ balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil });
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
                fetchDisputes();
            }
        }
    }

    const goToNextPage = () => {
        if (hasNext.value && cursor.value) {
            isPaginating = true;
            page.value++;
            fetchDisputes(cursor.value);
        }
    };

    const goToPreviousPage = () => {
        if (hasPrevious.value && prevCursor.value) {
            isPaginating = true;
            page.value--;
            fetchDisputes(prevCursor.value);
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
        const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil, refreshToken } = props();
        return JSON.stringify({
            balanceAccountId,
            statusGroup,
            reasonCategories,
            schemeCodes,
            createdSince,
            createdUntil,
            limit: limit.value,
            refreshToken,
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
            fetchDisputes();
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
