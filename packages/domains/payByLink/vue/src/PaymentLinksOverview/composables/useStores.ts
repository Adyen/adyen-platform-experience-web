import { ref, computed, watch } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import { useConfigContext } from '@integration-components/core/vue';
import type { StoreData, StoreIds } from '../../../../domain/src';

/**
 * Vue composable counterpart of the Preact `useStores` hook. Fetches the merchant's Pay by Link
 * stores once, then derives the `storeIds`-filtered subset alongside the unfiltered full list.
 */
export function useStores(storeIds?: () => StoreIds | undefined) {
    const config = useConfigContext();

    const getPayByLinkStores = computed(() => config.endpoints.getPayByLinkStores);
    const allStores = ref<StoreData[] | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<Error | undefined>(undefined);

    async function fetchStores() {
        const fn = getPayByLinkStores.value;
        if (!isFunction(fn)) return;

        isFetching.value = true;
        error.value = undefined;

        try {
            const response = await fn(EMPTY_OBJECT, EMPTY_OBJECT);
            allStores.value = response?.data
                ?.filter(store => !!store.storeId)
                .map(store => ({
                    id: store.storeId || '',
                    name: store.storeCode || '',
                    storeCode: store.storeCode || '',
                    description: store.description || '',
                }));
        } catch (e) {
            error.value = e as Error;
        } finally {
            isFetching.value = false;
        }
    }

    watch(getPayByLinkStores, () => void fetchStores(), { immediate: true });

    const filteredStores = computed<StoreData[] | undefined>(() => {
        const ids = storeIds?.();
        return allStores.value?.filter(store => {
            if (!store.id) return false;
            return !ids || (typeof ids === 'string' ? store.id === ids : ids.includes(store.id));
        });
    });

    return { allStores, filteredStores, isFetching, error } as const;
}

export default useStores;
