import { useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';

export const useStores = (storeIds?: string | string[], preselect = true) => {
    const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);
    const { getPayByLinkStores } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkStores,
                },
                queryFn: async () => getPayByLinkStores?.(EMPTY_OBJECT, EMPTY_OBJECT),
            }),
            [getPayByLinkStores]
        )
    );

    const filteredStores = useMemo(
        () =>
            data?.data
                ?.filter(store => {
                    if (!store.storeId) return false;
                    return !storeIds || (typeof storeIds === 'string' ? store.storeId === storeIds : storeIds?.includes(store.storeId));
                })
                .map(store => ({
                    id: store.storeId || '',
                    name: store.storeCode || '',
                    storeCode: store.storeCode || '',
                    description: store.description || '',
                })),
        [data, storeIds]
    );

    const allStores = useMemo(
        () =>
            data?.data?.map(store => ({
                id: store.storeId || '',
                name: store.storeCode || '',
                storeCode: store.storeCode || '',
                description: store.description || '',
            })),
        [data]
    );

    useEffect(() => {
        if (!selectedStore && filteredStores && filteredStores?.length > 0 && preselect) {
            setSelectedStore(filteredStores?.[0]?.id);
        }
    }, [filteredStores, selectedStore, preselect]);

    return { filteredStores, selectedStore, setSelectedStore, isFetching, error, allStores };
};
