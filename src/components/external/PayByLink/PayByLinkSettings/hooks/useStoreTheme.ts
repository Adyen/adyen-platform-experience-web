import { useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';

export const useStoreTheme = (selectedStore: string) => {
    const { getPayByLinkTheme } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkTheme,
                },
                queryFn: async () => getPayByLinkTheme?.(EMPTY_OBJECT, { path: { storeId: selectedStore } }),
            }),
            [getPayByLinkTheme, selectedStore]
        )
    );

    //TODO: Add IDs for Select component compatibility
    const theme = useMemo(() => {
        return data;
    }, [data]);

    return { theme, isFetching };
};
