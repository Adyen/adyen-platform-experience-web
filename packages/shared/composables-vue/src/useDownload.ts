import { ref, watch, computed, onUnmounted } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { DownloadStreamEndpoint, EndpointDownloadStreamData } from '@integration-components/types/api/endpoints';

/**
 * Vue composable counterpart of the Preact `useDownload` hook.
 * Fetches a download endpoint and triggers an optional success callback with the blob data.
 */
export function useDownload(
    endpointName: DownloadStreamEndpoint,
    queryParam: () => Record<string, any>,
    enabled: () => boolean,
    onSuccess?: (data: EndpointDownloadStreamData) => void
) {
    const config = useConfigContext();

    const isFetching = ref(false);
    const error = ref<Error | undefined>(undefined);

    let abortController: AbortController | null = null;

    const downloadEndpoint = computed(() => config.endpoints[endpointName] as ((...args: any[]) => Promise<EndpointDownloadStreamData>) | undefined);
    const canFetch = computed(() => isFunction(downloadEndpoint.value) && enabled());

    async function runDownload() {
        if (!canFetch.value || !isFunction(downloadEndpoint.value)) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const result = await downloadEndpoint.value({ signal }, { ...queryParam() });
            if (!signal.aborted) {
                onSuccess?.(result);
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
            }
        }
    }

    watch(canFetch, newCanFetch => {
        if (!newCanFetch) return;
        void runDownload();
    });

    onUnmounted(() => abortController?.abort());

    return { isFetching, error } as const;
}

export default useDownload;
