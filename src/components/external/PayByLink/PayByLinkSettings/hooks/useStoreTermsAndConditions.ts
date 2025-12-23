import { useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';

export const useStoreTermsAndConditions = (selectedStore: string | undefined, enabled: boolean, setEnabled: Dispatch<StateUpdater<boolean>>) => {
    const { getPayByLinkSettings } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkSettings && enabled && !!selectedStore,
                    onSuccess: () => {
                        setEnabled(false);
                    },
                },
                queryFn: async () => getPayByLinkSettings?.(EMPTY_OBJECT, { path: { storeId: selectedStore! } }),
            }),
            [getPayByLinkSettings, selectedStore, enabled, setEnabled]
        )
    );

    return { data, isFetching };
};
