import { StateUpdater, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Dispatch } from 'preact/compat';

export const useStoreTheme = (selectedStore: string | undefined, enabled: boolean, setEnabled: Dispatch<StateUpdater<boolean>>) => {
    const { getPayByLinkTheme } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkTheme && enabled && !!selectedStore,
                    onSuccess: () => {
                        setEnabled(false);
                    },
                },
                queryFn: async () => getPayByLinkTheme?.(EMPTY_OBJECT, { path: { storeId: selectedStore! } }),
            }),
            [getPayByLinkTheme, selectedStore, enabled, setEnabled]
        )
    );

    //TODO: Add IDs for Select component compatibility
    const theme = useMemo(() => {
        return data;
    }, [data]);

    return { theme, isFetching };
};
