import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';
import { useMemo } from 'preact/hooks';

const usePayByLinkFilters = (enabled?: boolean) => {
    const { payByLinkFilters: getPayByLinkFiltersEndpointCall } = useConfigContext().endpoints;
    // const { getStores: getStoresEndpointCall } = useConfigContext().endpoints;

    // TODO: Add error case. Fallback can be static values or be received from CDN.
    const {
        data: filters,
        // isFetching: isFetchingFilters,
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

    // const {
    //     data: stores,
    //     isFetching: isFetchingStores,
    //     error: storeError,
    // } = useFetch(
    //     useMemo(
    //         () => ({
    //             fetchOptions: { enabled: !!getStoresEndpointCall && (enabled ?? true), keepPrevData: true },
    //             queryFn: async () => getStoresEndpointCall?.(),
    //         }),
    //         [getStoresEndpointCall, enabled]
    //     )
    // );

    // const isFetching = isFetchingStores || isFetchingFilters;

    return {
        filters,
        // stores,
        isFetching,
        error,
    } as const;
};

export default usePayByLinkFilters;
