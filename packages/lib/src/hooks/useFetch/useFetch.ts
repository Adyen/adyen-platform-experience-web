import { useEffect, useReducer, useRef } from 'preact/hooks';
import { httpGet } from '@src/core/Services/requests/http';
import { ErrorLevel, HttpOptions } from '@src/core/Services/requests/types';
import useCoreContext from '@src/core/Context/useCoreContext';

interface State<T> {
    data?: T;
    error?: Error;
    isFetching: boolean;
}

type Cache<T> = { [url: string]: T };

type Action<T> = { type: 'loading' } | { type: 'fetched'; payload: T } | { type: 'error'; payload: Error };

type FetchOptions = {
    enabled: boolean;
    refetchOnChange: string | number | (string | number)[];
    errorLevel: ErrorLevel;
    keepPrevData: boolean;
};

export function useFetch<T = unknown>(
    endpoint: { url: string; requestOptions?: RequestInit },
    fetchOptions: Partial<FetchOptions> = { keepPrevData: true }
): State<T> {
    const { loadingContext, clientKey } = useCoreContext();
    const cache = useRef<Cache<T>>({});
    // Used to prevent state update if the component is unmounted
    const cancelRequest = useRef<boolean>(false);

    const initialState: State<T> = {
        error: undefined,
        data: undefined,
        isFetching: fetchOptions.enabled !== false ? true : false,
    };

    // Keep state logic separated
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

    const fetchData = async () => {
        // If a cache exists for this url, return it
        if (cache.current[endpoint.url]) {
            dispatch({ type: 'fetched', payload: cache.current[endpoint.url]! });
            return;
        }

        dispatch({ type: 'loading' });

        const request: HttpOptions = {
            loadingContext,
            clientKey,
            path: endpoint.url,
            headers: endpoint.requestOptions?.headers,
            errorLevel: fetchOptions.errorLevel ?? 'error',
        };

        try {
            if (cancelRequest.current) return;
            const data = await httpGet<T>(request, endpoint.requestOptions?.body);
            cache.current[endpoint.url] = data;
            dispatch({ type: 'fetched', payload: data });
        } catch (error) {
            if (cancelRequest.current) return;
            dispatch({ type: 'error', payload: error as Error });
        }
    };

    useEffect(() => {
        cancelRequest.current = false;

        if (fetchOptions.enabled !== false) void fetchData();

        // Avoid a possible state update after the component was unmounted
        return () => {
            cancelRequest.current = true;
        };
    }, [endpoint.url, fetchOptions.refetchOnChange, fetchOptions.enabled]);

    return state;
}
