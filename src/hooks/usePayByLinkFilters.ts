import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';
import { useMemo } from 'preact/hooks';
import { useStores } from './useStores';

const usePayByLinkFilters = (storeIds?: string | string[]) => {
    const { payByLinkFilters: getPayByLinkFiltersEndpointCall } = useConfigContext().endpoints;

    // TODO: Add error case. Fallback can be static values or be received from CDN.
    const {
        data: filters,
        isFetching: isFetchingFilters,
        error: filterError,
    } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!getPayByLinkFiltersEndpointCall, keepPrevData: true },
                queryFn: async () => getPayByLinkFiltersEndpointCall?.(EMPTY_OBJECT),
            }),
            [getPayByLinkFiltersEndpointCall]
        )
    );

    const { filteredStores: stores, isFetching: isFetchingStores, error: storeError } = useStores(storeIds);

    const isFetching = isFetchingStores || isFetchingFilters;

    return {
        filters,
        stores,
        isFetching,
        filterError,
        storeError,
    } as const;
};

export default usePayByLinkFilters;
