import { useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { PaymentLinkSettingsPayload } from '../components/PaymentLinkSettingsContainer/context/types';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

export const useStoreTermsAndConditions = (
    selectedStore: string | undefined,
    enabled: boolean,
    setEnabled: Dispatch<StateUpdater<boolean>>,
    setPayload: (payload: PaymentLinkSettingsPayload) => void,
    setLoading: Dispatch<StateUpdater<boolean>>
) => {
    const { getPayByLinkSettings } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, isFetching, error } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkSettings && enabled && !!selectedStore,
                    onSuccess: () => {
                        setEnabled(false);
                        setLoading(false);
                    },
                },
                queryFn: async () => getPayByLinkSettings?.(EMPTY_OBJECT, { path: { storeId: selectedStore! } }),
            }),
            [getPayByLinkSettings, selectedStore, enabled, setEnabled, setLoading]
        )
    );

    const termsAndConditions = useMemo(() => {
        if ((!data || !data?.termsOfServiceUrl) && !isFetching && !error) return { termsOfServiceUrl: '' };
        return data;
    }, [data, isFetching, error]);

    useEffect(() => {
        setPayload(termsAndConditions);
    }, [termsAndConditions, setPayload]);

    const termsAndConditionsError = error as AdyenPlatformExperienceError;

    return { data: termsAndConditions, isFetching, error: termsAndConditionsError };
};
