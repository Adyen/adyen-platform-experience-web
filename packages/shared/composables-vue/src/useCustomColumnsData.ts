import { ref, watch, type Ref } from 'vue';
import { isFunction } from '@integration-components/utils';
import type { OnDataRetrievedCallback } from '@integration-components/types';

/**
 * Vue composable counterpart of the Preact `useCustomColumnsData` hook.
 *
 * Accepts reactive getters (so the composable always reads the latest values
 * without subscribing through ref unwrapping) and recomputes `customRecords`
 * whenever any of `records`, `hasCustomColumn` or `onDataRetrieve` change.
 *
 * The Preact equivalent lives in `packages/shared/hooks-preact/src/useCustomColumnsData.ts`.
 */
export interface UseCustomColumnsDataOptions<T> {
    records: () => T[] | undefined;
    hasCustomColumn?: () => boolean | undefined;
    onDataRetrieve?: () => OnDataRetrievedCallback<T[]> | undefined;
    mergeCustomData: (args: { retrievedData: Awaited<ReturnType<OnDataRetrievedCallback<T[]>>>; records: T[] }) => (T & Record<string, any>)[];
}

export function useCustomColumnsData<T>({ records, hasCustomColumn, onDataRetrieve, mergeCustomData }: UseCustomColumnsDataOptions<T>) {
    const customRecords = ref<T[] | (T & Record<string, any>)[]>([]) as Ref<T[] | (T & Record<string, any>)[]>;
    const loadingCustomRecords = ref(false);

    let runId = 0;

    async function recompute() {
        const currentRecords = records() ?? [];
        const enabled = !!hasCustomColumn?.();
        const retrieve = onDataRetrieve?.();
        const thisRun = ++runId;

        if (enabled && isFunction(retrieve)) {
            loadingCustomRecords.value = true;
            try {
                const retrievedData = await retrieve(currentRecords);
                if (thisRun !== runId) return;
                if (!Array.isArray(retrievedData)) throw new Error('Retrieved data should be an array');
                customRecords.value = mergeCustomData({
                    records: currentRecords,
                    retrievedData: (retrievedData?.filter(Boolean) ?? []) as Awaited<ReturnType<OnDataRetrievedCallback<T[]>>>,
                });
            } catch (error) {
                if (thisRun !== runId) return;
                customRecords.value = currentRecords;
                // eslint-disable-next-line no-console
                console.error(error);
            } finally {
                if (thisRun === runId) loadingCustomRecords.value = false;
            }
        } else {
            customRecords.value = currentRecords;
        }
    }

    watch(
        [() => records(), () => hasCustomColumn?.(), () => onDataRetrieve?.()],
        () => {
            void recompute();
        },
        { immediate: true }
    );

    return { customRecords, loadingCustomRecords } as const;
}

export default useCustomColumnsData;
