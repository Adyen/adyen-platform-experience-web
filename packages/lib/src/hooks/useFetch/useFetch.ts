import { useCallback, useEffect, useReducer, useRef } from 'preact/hooks';
import { ErrorLevel } from '@src/core/Services/requests/types';

interface State<T> {
    data?: T;
    error?: Error;
    isFetching: boolean;
}

type Cache<T> = Map<string, T>;

type Action<T> = { type: 'loading' } | { type: 'fetched'; payload: T } | { type: 'error'; payload: Error };

type FetchOptions = {
    enabled: boolean;
    errorLevel: ErrorLevel;
    keepPrevData: boolean;
};

type UseFetchConfig<QueryFn> = {
    loadingContext?: string;
    params?: Record<string, string | number | Date>;
    requestOptions?: RequestInit;
    fetchOptions?: Partial<FetchOptions>;
    queryFn: QueryFn;
};
export function useFetch<QueryFn extends (...args: any) => Promise<any>, T extends Awaited<ReturnType<QueryFn>>>({
    fetchOptions = { keepPrevData: true },
    queryFn,
    params,
}: UseFetchConfig<QueryFn>): State<T> {
    // TODO cache endpoint calls
    const cache = useRef<Cache<T>>(new Map());
    // Used to prevent state update if the component is unmounted
    const cancelRequest = useRef<boolean>(false);
    const initialState: State<T> = {
        error: undefined,
        data: undefined,
        isFetching: fetchOptions.enabled !== false,
    };
    const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
        switch (action.type) {
            case 'loading':
                return { ...initialState, isFetching: true, data: fetchOptions.keepPrevData ? state.data : undefined };
            case 'fetched':
                return { ...initialState, data: action.payload, isFetching: false };
            case 'error':
                return { ...initialState, error: action.payload, isFetching: false };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(fetchReducer, initialState);

    const fetchData = useCallback(async () => {
        // If a cache exists for this url, return it
        /* if (cache.current.get(url.href)) {
            dispatch({ type: 'fetched', payload: cache.current.get(url.href)! });
            return;
        } */

        dispatch({ type: 'loading' });

        try {
            if (cancelRequest.current) return;
            const data = await queryFn();

            // cache.current.set(url.href, data);

            dispatch({ type: 'fetched', payload: data });
        } catch (error) {
            if (cancelRequest.current) return;
            dispatch({ type: 'error', payload: error as Error });
        }
    }, [dispatch, queryFn]);

    useEffect(() => {
        cancelRequest.current = false;

        if (fetchOptions.enabled !== false) void fetchData();

        // Avoid a possible state update after the component was unmounted
        return () => {
            cancelRequest.current = true;
        };
    }, [fetchOptions.enabled, params, fetchData]);

    return state;
}
