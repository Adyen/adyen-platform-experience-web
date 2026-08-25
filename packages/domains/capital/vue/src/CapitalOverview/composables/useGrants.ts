import { computed, ref, watch, type Ref } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { shouldGetGrants } from '@integration-components/capital/domain';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { ICapitalState, IGrantsResponseDTO } from '@integration-components/types';

export const useGrants = (capitalState: Ref<ICapitalState | undefined>, isRegionSupported: Ref<boolean | undefined>) => {
    const config = useConfigContext();
    const getGrants = computed(() => config.endpoints.getGrants);

    const grantsQuery = {
        data: ref<IGrantsResponseDTO>(),
        error: ref<Error>(),
        isFetching: ref(false),
    };

    const shouldFetchGrants = computed(() => isFunction(getGrants.value) && shouldGetGrants(capitalState.value, !!isRegionSupported.value));

    const fetchGrants = async () => {
        const endpoint = getGrants.value;
        if (!isFunction(endpoint)) {
            return;
        }

        grantsQuery.isFetching.value = true;
        grantsQuery.error.value = undefined;

        try {
            grantsQuery.data.value = await endpoint(EMPTY_OBJECT);
        } catch (error) {
            grantsQuery.error.value = error as Error;
        } finally {
            grantsQuery.isFetching.value = false;
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
