import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';
import { useMemo } from 'preact/hooks';
import { useStores } from './useStores';
import AdyenPlatformExperienceError from '../core/Errors/AdyenPlatformExperienceError';

const usePaymentLinkFilters = (storeIds?: string | string[], enabled?: boolean) => {
    const { payByLinkFilters: getPayByLinkFiltersEndpointCall } = useConfigContext().endpoints;

    // TODO: Add error case. Fallback can be static values or be received from CDN.
    const {
        data: filters,
        isFetching: isFetchingFilters,
        error: filterError,
    } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!getPayByLinkFiltersEndpointCall && (enabled ?? true), keepPrevData: true },
                queryFn: async () => getPayByLinkFiltersEndpointCall?.(EMPTY_OBJECT),
            }),
            [getPayByLinkFiltersEndpointCall, enabled]
        )
    );

    const { filteredStores: stores, allStores, isFetching: isFetchingStores, error: storeError } = useStores(storeIds);

    const isFetching = isFetchingStores || isFetchingFilters;

    return {
        filters,
        stores,
        isFetching,
        allStores,
        filterError: filterError as AdyenPlatformExperienceError,
        storeError: storeError as AdyenPlatformExperienceError,
    } as const;
};

export default usePaymentLinkFilters;
