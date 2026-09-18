import { computed, watch, toValue, type MaybeRefOrGetter } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { getEnhancedCapitalState, getSupportedRegions } from '@integration-components/capital/domain';
import { useAsyncRequest } from '@integration-components/composables-vue';
import { EMPTY_OBJECT } from '@integration-components/utils';
import type { ICapitalState, IGrant } from '@integration-components/types';

type CapitalStateResponse = {
    capitalState: ICapitalState;
    supportedRegions: Awaited<ReturnType<typeof getSupportedRegions>>;
};

export const useEnhancedCapitalState = (isEnabled: MaybeRefOrGetter<boolean>, requestedGrant?: MaybeRefOrGetter<IGrant | undefined>) => {
    const config = useConfigContext();
    const { getCdnConfig } = useCoreContext();
    const request = useAsyncRequest<CapitalStateResponse>();
    const getCapitalState = computed(() => config.endpoints.getCapitalState);
    const capitalState = computed(() => {
        const response = request.data.value;
        return response ? getEnhancedCapitalState(response.capitalState, response.supportedRegions, toValue(requestedGrant)) : undefined;
    });

    watch(
        [() => toValue(isEnabled), getCapitalState],
        ([isEnabled, getCapitalState]) => {
            request.abort();

            if (!isEnabled || !getCapitalState) return;

            void request.execute(async signal => {
                const [capitalState, supportedRegions] = await Promise.all([
                    getCapitalState({ signal }, { query: EMPTY_OBJECT }),
                    getSupportedRegions(getCdnConfig),
                ]);

                return { capitalState, supportedRegions };
            });
        },
        { immediate: true }
    );

    return { capitalState, error: request.error, isLoading: request.isLoading } as const;
};
