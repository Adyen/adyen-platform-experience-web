import { ref, computed, watch } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import { useConfigContext } from '@integration-components/core/vue';
import type { IPaymentLinkFilters } from '@integration-components/types';

/**
 * Vue composable counterpart of the Preact `usePaymentLinkFilters` hook's filter-options portion:
 * fetches the allowed link types and per-status-group statuses from the Pay by Link filters endpoint.
 */
export function usePaymentLinkFilterOptions() {
    const config = useConfigContext();

    const payByLinkFilters = computed(() => config.endpoints.payByLinkFilters);
    const filters = ref<IPaymentLinkFilters | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<Error | undefined>(undefined);

    async function fetchFilters() {
        const fn = payByLinkFilters.value;
        if (!isFunction(fn)) return;

        isFetching.value = true;
        error.value = undefined;

        try {
            filters.value = await fn(EMPTY_OBJECT);
        } catch (e) {
            error.value = e as Error;
        } finally {
            isFetching.value = false;
        }
    }

    watch(payByLinkFilters, () => void fetchFilters(), { immediate: true });

    return { filters, isFetching, error } as const;
}

export default usePaymentLinkFilterOptions;
