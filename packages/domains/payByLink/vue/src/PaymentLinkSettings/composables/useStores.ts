import { computed, ref, watch } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { IPaymentLinkStore } from '@integration-components/types';
import type { StoreIds } from '@integration-components/payByLink/domain';
import { usePayByLinkContext } from '../../integration/context';
import type { StoreItem } from '../types';

const mapStore = (store: IPaymentLinkStore): StoreItem => ({
    id: store.storeId || '',
    name: store.storeCode || '',
    storeCode: store.storeCode || '',
    description: store.description || '',
});

export function useStores(storeIds?: StoreIds, preselect = true) {
    const runtime = usePayByLinkContext().runtime;
    const getPayByLinkStores = computed(() => runtime.endpoints.getPayByLinkStores);

    const selectedStore = ref<string | undefined>(undefined);
    const rawStores = ref<IPaymentLinkStore[] | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<AdyenPlatformExperienceError | undefined>(undefined);

    async function run() {
        const fn = getPayByLinkStores.value;
        if (!isFunction(fn)) return;

        isFetching.value = true;
        error.value = undefined;
        try {
            const response = await fn(EMPTY_OBJECT, EMPTY_OBJECT);
            rawStores.value = response?.data ?? [];
        } catch (e) {
            error.value = e as AdyenPlatformExperienceError;
        } finally {
            isFetching.value = false;
        }
    }

    watch(getPayByLinkStores, () => void run(), { immediate: true });

    const filteredStores = computed<StoreItem[] | undefined>(() =>
        rawStores.value
            ?.filter(store => {
                if (!store.storeId) return false;
                return !storeIds || (typeof storeIds === 'string' ? store.storeId === storeIds : storeIds.includes(store.storeId));
            })
            .map(mapStore)
    );

    const allStores = computed<StoreItem[] | undefined>(() => rawStores.value?.map(mapStore));

    function setSelectedStore(id: string | undefined) {
        selectedStore.value = id;
    }

    watch(
        filteredStores,
        stores => {
            if (!selectedStore.value && stores && stores.length > 0 && preselect) {
                setSelectedStore(stores[0]?.id);
            }
        },
        { immediate: true }
    );

    return { filteredStores, selectedStore, setSelectedStore, isFetching, error, allStores };
}

export default useStores;
