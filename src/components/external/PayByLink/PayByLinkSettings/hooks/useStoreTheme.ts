import { StateUpdater, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Dispatch } from 'preact/compat';
import { getThemePayload } from '../components/PayByLinkSettingsContainer/utils/getThemePayload';
import { IPayByLinkTheme } from '../../../../../types';
import { PayByLinkSettingsPayload } from '../components/PayByLinkSettingsContainer/context/types';

export const useStoreTheme = (
    selectedStore: string | undefined,
    enabled: boolean,
    setEnabled: Dispatch<StateUpdater<boolean>>,
    setPayload: (payload: PayByLinkSettingsPayload) => void,
    setLoading: Dispatch<StateUpdater<boolean>>
) => {
    const { getPayByLinkTheme } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkTheme && enabled && !!selectedStore,
                    onSuccess: () => {
                        setEnabled(false);
                        setLoading(false);
                    },
                },
                queryFn: async () => getPayByLinkTheme?.(EMPTY_OBJECT, { path: { storeId: selectedStore! } }),
            }),
            [getPayByLinkTheme, selectedStore, enabled, setEnabled, setLoading]
        )
    );

    //TODO: Add IDs for Select component compatibility
    const theme = useMemo(() => {
        if (!data && !isFetching && !error) return {};
        return {
            ...(data?.brandName ? { brandName: data?.brandName } : {}),
            ...(data?.logoUrl ? { logo: data?.logoUrl } : {}),
            ...(data?.fullWidthLogoUrl ? { fullWidthLogo: data?.fullWidthLogoUrl } : {}),
        };
    }, [data, isFetching, error]);

    useEffect(() => {
        setPayload(getThemePayload(theme as IPayByLinkTheme));
    }, [theme, setPayload]);

    return { theme, isFetching, error };
};
