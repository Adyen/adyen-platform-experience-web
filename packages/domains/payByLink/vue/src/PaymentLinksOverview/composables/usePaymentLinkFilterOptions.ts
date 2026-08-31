import { ref, computed, watch } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { IPaymentLinkFilters } from '@integration-components/types';
import { toError } from '../utils/error';
import { usePayByLinkContext } from '../../integration/context';

/**
 * Vue composable counterpart of the Preact `usePaymentLinkFilters` hook's filter-options portion:
 * fetches the allowed link types and per-status-group statuses from the Pay by Link filters endpoint.
 */
export function usePaymentLinkFilterOptions() {
    const runtime = usePayByLinkContext().runtime;

    const payByLinkFilters = computed(() => runtime.endpoints.payByLinkFilters);
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
            error.value = toError(e);
        } finally {
            isFetching.value = false;
        }
    }

    watch(payByLinkFilters, () => void fetchFilters(), { immediate: true });

    return { filters, isFetching, error } as const;
}

export default usePaymentLinkFilterOptions;
