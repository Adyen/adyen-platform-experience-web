import { ref, watch, onUnmounted, type Ref } from 'vue';

export interface FetchState<T> {
    data: Ref<T | undefined>;
    error: Ref<Error | undefined>;
    isFetching: Ref<boolean>;
    refetch: () => void;
}

export interface UseFetchConfig<T> {
    queryFn: () => Promise<T | undefined>;
    enabled?: () => boolean;
    keepPrevData?: boolean;
}

export function useFetch<T>({ queryFn, enabled, keepPrevData }: UseFetchConfig<T>): FetchState<T> {
    const data = ref<T | undefined>() as Ref<T | undefined>;
    const error = ref<Error | undefined>();
    const isFetching = ref(false);
    let cancelled = false;

    const fetchData = async () => {
        if (cancelled) return;
        isFetching.value = true;
        error.value = undefined;
        if (!keepPrevData) data.value = undefined;

        try {
            const result = await queryFn();
            if (!cancelled) {
                data.value = result;
            }
        } catch (e) {
            if (!cancelled) {
                error.value = e as Error;
            }
        } finally {
            if (!cancelled) {
                isFetching.value = false;
            }
        }
    };

    const refetch = () => {
        fetchData();
    };

    // Watch enabled flag and queryFn to trigger fetches
    watch(
        () => ({ isEnabled: enabled ? enabled() : true, fn: queryFn }),
        ({ isEnabled }) => {
            if (isEnabled) {
                fetchData();
            }
        },
        { immediate: true }
    );

    onUnmounted(() => {
        cancelled = true;
    });

    return { data, error, isFetching, refetch };
}

export default useFetch;
