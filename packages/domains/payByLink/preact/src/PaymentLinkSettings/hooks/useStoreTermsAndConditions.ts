import { useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { useFetch } from '@integration-components/hooks-preact';
import { useConfigContext } from '@integration-components/core/preact';
import { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { PaymentLinkSettingsPayload } from '../components/PaymentLinkSettingsContainer/context/types';
import { AdyenPlatformExperienceError } from '@integration-components/core';

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
