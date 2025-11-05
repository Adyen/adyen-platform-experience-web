import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';
import { useMemo } from 'preact/hooks';

const usePayByLinkFilters = (enabled?: boolean) => {
    const { getPayByLinkFilters: getPayByLinkFiltersEndpointCall } = useConfigContext().endpoints;

    // TODO: Add error case. Fallback can be static values or be received from CDN.
    const {
        data: filters,
        isFetching,
        error,
    } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!getPayByLinkFiltersEndpointCall && (enabled ?? true), keepPrevData: true },
                queryFn: async () => getPayByLinkFiltersEndpointCall?.(EMPTY_OBJECT),
            }),
            [getPayByLinkFiltersEndpointCall, enabled]
        )
    );

    return { filters, isFetching, error } as const;
};

export default usePayByLinkFilters;
