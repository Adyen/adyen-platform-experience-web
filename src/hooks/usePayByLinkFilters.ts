import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';
import { useMemo } from 'preact/hooks';
import { useStores } from './useStores';

const usePayByLinkFilters = (storeIds?: string | string[], enabled?: boolean) => {
    const { payByLinkFilters: getPayByLinkFiltersEndpointCall, getPayByLinkStores: getStoresEndpointCall } = useConfigContext().endpoints;

    // TODO: Add error case. Fallback can be static values or be received from CDN.
    const {
        data: filters,
        isFetching: isFetchingFilters,
        error: filtersError,
    } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!getPayByLinkFiltersEndpointCall && (enabled ?? true), keepPrevData: true },
                queryFn: async () => getPayByLinkFiltersEndpointCall?.(EMPTY_OBJECT),
            }),
            [getPayByLinkFiltersEndpointCall, enabled]
        )
    );

    const { filteredStores: stores, isFetching: isFetchingStores, error: storeError } = useStores(storeIds);

    const isFetching = isFetchingStores || isFetchingFilters;

    return {
        filters,
        stores,
        isFetching,
        filtersError,
        storeError,
    } as const;
};

export default usePayByLinkFilters;
