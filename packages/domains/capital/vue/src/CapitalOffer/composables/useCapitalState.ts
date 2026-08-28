import { computed, watch } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { getEnhancedCapitalState, getSupportedRegions, type EnhancedCapitalState } from '@integration-components/capital/domain';
import { useAsyncRequest } from '@integration-components/composables-vue';
import { EMPTY_OBJECT } from '@integration-components/utils';

export const useCapitalState = (isEnabled: () => boolean) => {
    const config = useConfigContext();
    const { getCdnConfig } = useCoreContext();
    const request = useAsyncRequest<EnhancedCapitalState | undefined>();
    const getCapitalState = computed(() => config.endpoints.getCapitalState);

    watch(
        [isEnabled, getCapitalState],
        ([enabled, getCapitalStateRequest]) => {
            request.abort();

            if (!enabled || !getCapitalStateRequest) return;

            void request.execute(async signal => {
                const [backendCapitalState, supportedRegions] = await Promise.all([
                    getCapitalStateRequest({ signal }, { query: EMPTY_OBJECT }),
                    getSupportedRegions(getCdnConfig),
                ]);

                return getEnhancedCapitalState(backendCapitalState, supportedRegions);
            });
        },
        { immediate: true }
    );

    return { capitalState: request.data, error: request.error, isLoading: request.isLoading } as const;
};
