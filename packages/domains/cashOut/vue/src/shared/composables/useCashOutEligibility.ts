import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import type { ICashOutEligibility } from '@integration-components/types';

/** Fetches the eligibility of the balance account with the given account key, as the balance accounts endpoint returns it. */
export const useCashOutEligibility = (accountKey: MaybeRefOrGetter<string | undefined>) => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutEligibility>();
    const getCashOutEligibility = computed(() => config.endpoints.getCashOutEligibility);
    const refreshCount = ref(0);
    // When the eligibility shown was loaded; it stays while the next one loads.
    const lastUpdated = ref<number>();

    watch(
        [() => toValue(accountKey), getCashOutEligibility, refreshCount],
        ([key, endpoint]) => {
            request.abort();
            // The eligibility of the previous balance account must not show while the next one loads.
            request.data.value = undefined;
            request.error.value = undefined;

            if (!key || !endpoint) return;
            void request.execute(signal => endpoint({ signal }, { path: { accountKey: key } }));
        },
        { immediate: true }
    );

    watch(request.data, eligibility => {
        if (eligibility) lastUpdated.value = Date.now();
    });

    return {
        eligibility: request.data,
        eligibilityError: request.error,
        isFetchingEligibility: request.isLoading,
        lastUpdated,
        refreshEligibility: () => refreshCount.value++,
    } as const;
};
