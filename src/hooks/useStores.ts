import { useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { EMPTY_OBJECT } from '../utils';

export const useStores = () => {
    const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);
    const { getStores } = useConfigContext().endpoints;

    const { data } = useFetch(
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
        setSelectedStore(stores?.[0]?.id);
    }, [stores]);

    return { stores, selectedStore, setSelectedStore };
};
