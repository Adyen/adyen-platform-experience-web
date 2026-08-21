import { computed, ref, watch, type Ref } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import { useConfigContext } from '@integration-components/core/vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { IPaymentLinkTheme } from '@integration-components/types';
import type { ThemeFormData } from '../types';

export function useStoreTheme(selectedStore: Ref<string | undefined>, enabled: Ref<boolean>) {
    const config = useConfigContext();
    const getPayByLinkTheme = computed(() => config.endpoints.getPayByLinkTheme);

    const data = ref<IPaymentLinkTheme | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<AdyenPlatformExperienceError | undefined>(undefined);

    async function run() {
        const fn = getPayByLinkTheme.value;
        const store = selectedStore.value;
        if (!isFunction(fn) || !enabled.value || !store) return;

        isFetching.value = true;
        error.value = undefined;
        try {
            data.value = await fn(EMPTY_OBJECT, { path: { storeId: store } });
        } catch (e) {
            error.value = e as AdyenPlatformExperienceError;
        } finally {
            isFetching.value = false;
        }
    }

    watch([selectedStore, enabled], () => void run(), { immediate: true });

    const theme = computed<ThemeFormData>(() => {
        if (!data.value && !isFetching.value && !error.value) return {};
        return {
            ...(data.value?.brandName ? { brandName: data.value.brandName } : {}),
            ...(data.value?.logoUrl ? { logo: data.value.logoUrl } : {}),
            ...(data.value?.fullWidthLogoUrl ? { fullWidthLogo: data.value.fullWidthLogoUrl } : {}),
        };
    });

    return { theme, isFetching, error };
}

export default useStoreTheme;
