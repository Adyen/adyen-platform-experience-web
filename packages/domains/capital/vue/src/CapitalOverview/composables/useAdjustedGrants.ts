import { computed, reactive, ref, watch, type Ref } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { EnhancedCapitalState, getAdjustedGrants } from '@integration-components/capital/domain';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { IGrant, IGrantsResponseDTO } from '@integration-components/types';

export const useAdjustedGrants = (
    capitalState: Ref<EnhancedCapitalState | undefined>,
    isRegionSupported: Ref<boolean | undefined>,
    requestedGrant?: Ref<IGrant | undefined>
) => {
    const config = useConfigContext();
    const getGrants = computed(() => config.endpoints.getGrants);
    const backendGrants = ref<IGrantsResponseDTO>();

    const grantsQuery = reactive({
        data: computed(() => getAdjustedGrants(capitalState.value, backendGrants.value, requestedGrant?.value)),
        error: ref<Error>(),
        isFetching: ref(false),
    });

    const shouldFetchGrants = computed(
        () => isFunction(getGrants.value) && !requestedGrant?.value && capitalState.value && capitalState.value.hasGrants && !!isRegionSupported.value
    );

    const fetchGrants = async () => {
        const endpoint = getGrants.value;
        if (!isFunction(endpoint)) {
            return;
        }

        backendGrants.value = undefined;
        grantsQuery.error = undefined;
        grantsQuery.isFetching = true;

        try {
            backendGrants.value = await endpoint(EMPTY_OBJECT);
        } catch (error) {
            grantsQuery.error = error as Error;
        } finally {
            grantsQuery.isFetching = false;
        }
    };

    watch(
        [getGrants, shouldFetchGrants],
        ([endpoint, isEnabled]) => {
            if (isFunction(endpoint) && isEnabled) {
                void fetchGrants();
            }
        },
        { immediate: true }
    );

    return grantsQuery;
};
