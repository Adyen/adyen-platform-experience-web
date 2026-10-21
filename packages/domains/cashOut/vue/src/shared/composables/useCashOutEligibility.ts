import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import type { ICashOutEligibility } from '@integration-components/types';

export const useCashOutEligibility = (balanceAccountId: MaybeRefOrGetter<string | undefined>) => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutEligibility>();
    const getCashOutEligibility = computed(() => config.endpoints.getCashOutEligibility);

    watch(
        [() => toValue(balanceAccountId), getCashOutEligibility],
        ([id, endpoint]) => {
            request.abort();
            // The eligibility of the previous balance account must not show while the next one loads.
            request.data.value = undefined;
            request.error.value = undefined;

            if (!id || !endpoint) return;

            // The cashOut endpoints take the balance account id as their account key.
            void request.execute(signal => endpoint({ signal }, { path: { accountKey: id } }));
        },
        { immediate: true }
    );

    return {
        eligibility: request.data,
        eligibilityError: request.error,
        isFetchingEligibility: request.isLoading,
    } as const;
};
