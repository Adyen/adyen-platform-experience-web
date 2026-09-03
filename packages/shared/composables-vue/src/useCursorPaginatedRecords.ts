import { computed, onScopeDispose, ref, watch } from 'vue';

export interface CursorPaginatedResponse<T> {
    records: T[] | undefined;
    nextCursor?: string;
    previousCursor?: string;
}

export interface CursorPageRequest {
    cursor?: string;
    limit: number;
    signal: AbortSignal;
}

export interface CursorPageError<T> {
    error: Error;
    records?: T[];
    hasNext?: boolean;
    hasPrevious?: boolean;
}

interface UseCursorPaginatedRecordsOptions<T> {
    getFetchKey: () => string | null;
    fetchPage: (request: CursorPageRequest) => Promise<CursorPaginatedResponse<T>>;
    preferredLimit: number;
    limitOptions?: () => readonly number[] | undefined;
    onSuccess?: (response: CursorPaginatedResponse<T>) => void;
    onError?: (error: unknown) => CursorPageError<T>;
}

export function useCursorPaginatedRecords<T>({
    getFetchKey,
    fetchPage,
    preferredLimit,
    limitOptions,
    onSuccess,
    onError = reason => ({ error: reason as Error }),
}: UseCursorPaginatedRecordsOptions<T>) {
    const records = ref<T[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const fetching = ref(false);
    const limit = ref(preferredLimit);
    const cursor = ref<string | undefined>(undefined);
    const previousCursor = ref<string | undefined>(undefined);
    const hasNext = ref(false);
    const hasPrevious = ref(false);
    const page = ref(0);
    const hasFetchedOnce = ref(false);
    const lastFetchedRequestKey = ref<string | null>(null);

    let abortController: AbortController | undefined;

    const requestKey = computed(() => {
        const fetchKey = getFetchKey();
        return fetchKey ? JSON.stringify({ fetchKey, limit: limit.value }) : null;
    });

    const resetPagination = () => {
        page.value = 0;
        cursor.value = undefined;
        previousCursor.value = undefined;
        hasNext.value = false;
        hasPrevious.value = false;
    };

    const requestPage = async (requestCursor?: string) => {
        if (!requestKey.value) return;
        const requestedKey = requestKey.value;

        abortController?.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;

        try {
            const response = await fetchPage({ cursor: requestCursor, limit: limit.value, signal });
            if (signal.aborted) return;

            hasFetchedOnce.value = true;
            lastFetchedRequestKey.value = requestedKey;
            records.value = response.records;
            hasNext.value = !!response.nextCursor;
            hasPrevious.value = !!response.previousCursor;
            cursor.value = response.nextCursor;
            previousCursor.value = response.previousCursor;
            onSuccess?.(response);
        } catch (reason) {
            if (!signal.aborted) {
                const pageError = onError(reason);
                error.value = pageError.error;
                if (pageError.records) records.value = pageError.records;
                if (pageError.hasNext !== undefined) hasNext.value = pageError.hasNext;
                if (pageError.hasPrevious !== undefined) hasPrevious.value = pageError.hasPrevious;
            }
        } finally {
            if (!signal.aborted) {
                fetching.value = false;
            }
        }
    };

    const navigate = (requestCursor: string | undefined, pageDelta: 1 | -1) => {
        if (!requestCursor || fetching.value) return;

        const currentPage = page.value;
        const requestedPage = currentPage + pageDelta;
        page.value = requestedPage;

        requestPage(requestCursor).then(() => {
            if (error.value && page.value === requestedPage) {
                page.value = currentPage;
            }
        });
    };

    const goToNextPage = () => {
        if (hasNext.value) {
            navigate(cursor.value, 1);
        }
    };

    const goToPreviousPage = () => {
        if (hasPrevious.value) {
            navigate(previousCursor.value, -1);
        }
    };

    const updateLimit = (newLimit: number) => {
        limit.value = newLimit;
    };

    watch(
        requestKey,
        (newKey, oldKey) => {
            if (!newKey || newKey === lastFetchedRequestKey.value) return;
            if (oldKey !== undefined) resetPagination();
            requestPage();
        },
        { immediate: true }
    );

    onScopeDispose(() => abortController?.abort());

    return {
        error,
        fetching,
        records,
        page,
        limit,
        limitOptions: computed(() => limitOptions?.()),
        hasNext,
        hasPrevious,
        hasFetchedOnce,
        goToNextPage,
        goToPreviousPage,
        updateLimit,
        resetPagination,
    } as const;
}

export default useCursorPaginatedRecords;
