import { computed, ref, watch } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { ICapitalState } from '@integration-components/types';

export const useCapitalState = () => {
    const config = useConfigContext();
    const getCapitalState = computed(() => config.endpoints.getCapitalState);

    const capitalStateQuery = {
        data: ref<ICapitalState>(),
        error: ref<Error>(),
        isFetching: ref(false),
    };

    const fetchCapitalState = async () => {
        const endpoint = getCapitalState.value;

        if (!isFunction(endpoint)) {
            return;
        }

        capitalStateQuery.isFetching.value = true;
        capitalStateQuery.error.value = undefined;

        try {
            capitalStateQuery.data.value = await endpoint(EMPTY_OBJECT, { query: EMPTY_OBJECT });
        } catch (error) {
            capitalStateQuery.error.value = error as Error;
        } finally {
            capitalStateQuery.isFetching.value = false;
        }
    };

    watch(
        getCapitalState,
        endpoint => {
            if (isFunction(endpoint)) {
                void fetchCapitalState();
            }
        },
        { immediate: true }
    );

    return capitalStateQuery;
};
