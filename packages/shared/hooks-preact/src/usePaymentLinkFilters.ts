import { useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import { useConfigContext } from '@integration-components/core/preact';
import { useFetch } from './useFetch';
import { useStores } from './useStores';

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
