import { useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';

export const useStores = () => {
    const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);
    const { getStores } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getStores,
                },
                queryFn: async () => getStores?.(EMPTY_OBJECT, EMPTY_OBJECT),
            }),
            [getStores]
        )
    );

    //Add IDs for Select component compatibility
    const stores = useMemo(
        () =>
            data?.data?.map(store => ({
                ...store,
                id: store.storeCode || '',
                name: store.storeCode || '',
                storeCode: store.storeCode || '',
                description: store.description || '',
            })),
        [data]
    );

    useEffect(() => {
        if (!selectedStore && stores && stores?.length > 0) {
            setSelectedStore(stores?.[0]?.id);
        }
    }, [stores, selectedStore]);

    return { stores, selectedStore, setSelectedStore };
};
