import { computed, ref, watch, type Ref } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import { useConfigContext } from '@integration-components/core/vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';

export function useStoreTermsAndConditions(selectedStore: Ref<string | undefined>, enabled: Ref<boolean>) {
    const config = useConfigContext();
    const getPayByLinkSettings = computed(() => config.endpoints.getPayByLinkSettings);

    const raw = ref<IPaymentLinkTermsAndConditions | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<AdyenPlatformExperienceError | undefined>(undefined);

    async function run() {
        const fn = getPayByLinkSettings.value;
        const store = selectedStore.value;
        if (!isFunction(fn) || !enabled.value || !store) return;

        isFetching.value = true;
        error.value = undefined;
        try {
            raw.value = await fn(EMPTY_OBJECT, { path: { storeId: store } });
        } catch (e) {
            error.value = e as AdyenPlatformExperienceError;
        } finally {
            isFetching.value = false;
        }
    }

    watch([selectedStore, enabled], () => void run(), { immediate: true });

    const data = computed<IPaymentLinkTermsAndConditions>(() => {
        if ((!raw.value || !raw.value.termsOfServiceUrl) && !isFetching.value && !error.value) return { termsOfServiceUrl: '' };
        return raw.value ?? { termsOfServiceUrl: '' };
    });

    return { data, isFetching, error };
}

export default useStoreTermsAndConditions;
