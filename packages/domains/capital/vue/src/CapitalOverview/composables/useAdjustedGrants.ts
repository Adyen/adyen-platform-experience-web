import { computed, watch, toValue, type MaybeRefOrGetter } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { EnhancedCapitalState, getAdjustedGrants } from '@integration-components/capital/domain';
import type { IGrant, IGrantsResponseDTO } from '@integration-components/types';
import { useAsyncRequest } from '@integration-components/composables-vue';

export const useAdjustedGrants = (capitalState: MaybeRefOrGetter<EnhancedCapitalState>, requestedGrant?: MaybeRefOrGetter<IGrant | undefined>) => {
    const config = useConfigContext();
    const request = useAsyncRequest<IGrantsResponseDTO>();
    const getGrants = computed(() => config.endpoints.getGrants);
    const grants = computed(() => getAdjustedGrants(toValue(capitalState), request.data.value?.data, toValue(requestedGrant)));
    const isEnabled = computed(() => {
        const state = toValue(capitalState);
        return !!state?.hasGrants && state.isRegionSupported;
    });

    watch(
        [isEnabled, getGrants],
        ([enabled, endpoint]) => {
            request.abort();

            if (!enabled || !endpoint) return;

            void request.execute(signal => endpoint({ signal }));
        },
        { immediate: true }
    );

    return { grants, error: request.error, isLoading: request.isLoading } as const;
};
