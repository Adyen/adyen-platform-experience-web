import { StateUpdater, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Dispatch } from 'preact/compat';
import { getThemePayload } from '../components/PaymentLinkSettingsContainer/utils/getThemePayload';
import { IPaymentLinkTheme } from '../../../../../types';
import { PaymentLinkSettingsPayload } from '../components/PaymentLinkSettingsContainer/context/types';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

export const useStoreTheme = (
    selectedStore: string | undefined,
    enabled: boolean,
    setEnabled: Dispatch<StateUpdater<boolean>>,
    setPayload: (payload: PaymentLinkSettingsPayload) => void,
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
        setPayload(getThemePayload(theme as IPaymentLinkTheme));
    }, [theme, setPayload]);

    const themeError = error as AdyenPlatformExperienceError;

    return { theme, isFetching, error: themeError };
};
