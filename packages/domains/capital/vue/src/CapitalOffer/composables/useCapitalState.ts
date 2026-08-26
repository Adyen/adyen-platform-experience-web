import { computed, watch } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { getEnhancedCapitalState, getSupportedRegions, type EnhancedCapitalState } from '@integration-components/capital/domain';
import { useAsyncRequest } from '@integration-components/composables-vue';
import { EMPTY_OBJECT } from '@integration-components/utils';

export const useCapitalState = (isEnabled: () => boolean) => {
    const { endpoints } = useConfigContext();
    const { getCdnConfig } = useCoreContext();
    const request = useAsyncRequest<EnhancedCapitalState | undefined>();
    const getCapitalState = computed(() => endpoints.getCapitalState);

    watch(
        [isEnabled, getCapitalState],
        ([enabled, getCapitalState]) => {
            request.abort();

            if (!enabled || !getCapitalState) return;

            void request.execute(async signal => {
                const [backendCapitalState, supportedRegions] = await Promise.all([
                    getCapitalState({ signal }, { query: EMPTY_OBJECT }),
                    getSupportedRegions(getCdnConfig),
                ]);

                return getEnhancedCapitalState(backendCapitalState, supportedRegions);
            });
        },
        { immediate: true }
    );

    return { capitalState: request.data, error: request.error, isLoading: request.isLoading } as const;
};
