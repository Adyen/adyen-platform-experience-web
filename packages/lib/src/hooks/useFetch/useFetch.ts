import { useEffect, useReducer, useRef } from 'preact/hooks';
import { httpGet } from '@src/core/Services/requests/http';
import { ErrorLevel, HttpOptions } from '@src/core/Services/requests/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { parseSearchParams } from '@src/core/Services/requests/utils';

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

type UseFetchConfig = {
    url: string;
    loadingContext?: string;
    params?: Record<string, string | number | Date>;
    requestOptions?: RequestInit;
    fetchOptions: Partial<FetchOptions>;
};
export function useFetch<T = unknown>(
    config: UseFetchConfig = {
        url: '',
        fetchOptions: { keepPrevData: true },
    }
): State<T> {
    const { loadingContext, clientKey } = useCoreContext();
    const cache = useRef<Cache<T>>(new Map());
    // Used to prevent state update if the component is unmounted
    const cancelRequest = useRef<boolean>(false);
    const initialState: State<T> = {
        error: undefined,
        data: undefined,
        isFetching: config.fetchOptions.enabled !== false,
    };

    const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
        switch (action.type) {
            case 'loading':
                return { ...initialState, isFetching: true, data: config.fetchOptions.keepPrevData ? state.data : undefined };
            case 'fetched':
                return { ...initialState, data: action.payload, isFetching: false };
            case 'error':
                return { ...initialState, error: action.payload, isFetching: false };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(fetchReducer, initialState);

    const url = new URL(`${loadingContext}${config.url}`);

    const request: HttpOptions = {
        loadingContext: config.loadingContext ?? loadingContext,
        clientKey,
        path: config.url,
        headers: config.requestOptions?.headers,
        errorLevel: config.fetchOptions.errorLevel ?? 'error',
    };

    if (config.params) {
        const searchParams = parseSearchParams(config.params);

        searchParams.forEach((value, param) => url.searchParams.set(param, value));

        request.params = searchParams;
    }

    const fetchData = async () => {
        // If a cache exists for this url, return it
        if (cache.current.get(url.href)) {
            dispatch({ type: 'fetched', payload: cache.current.get(url.href)! });
            return;
        }

        dispatch({ type: 'loading' });

        try {
            if (cancelRequest.current) return;
            const data = await httpGet<T>(request);

            cache.current.set(url.href, data);

            dispatch({ type: 'fetched', payload: data });
        } catch (error) {
            if (cancelRequest.current) return;
            dispatch({ type: 'error', payload: error as Error });
        }
    };

    useEffect(() => {
        cancelRequest.current = false;

        if (config.fetchOptions.enabled !== false) void fetchData();

        // Avoid a possible state update after the component was unmounted
        return () => {
            cancelRequest.current = true;
        };
    }, [config.url, config.fetchOptions.enabled, config.params]);

    return state;
}
