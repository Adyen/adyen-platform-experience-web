import { computed, onUnmounted, ref, watch } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';

interface UseDisputeDetailsProps {
    disputeId: string;
    fetchEnabled: boolean;
}

export type DisputeError = Error & {
    errorCode?: string;
    requestId?: string;
};

export function useDisputeDetails(props: () => UseDisputeDetailsProps) {
    const config = useConfigContext();
    const data = ref<IDisputeDetail | undefined>(undefined);
    const error = ref<DisputeError | undefined>(undefined);
    const isFetching = ref(false);
    let abortController: AbortController | null = null;

    const getDisputeDetail = computed(() => config.endpoints.getDisputeDetail);
    const canFetch = computed(() => isFunction(getDisputeDetail.value) && props().fetchEnabled);

    async function runFetch() {
        const fn = getDisputeDetail.value;
        const { disputeId } = props();
        if (!isFunction(fn) || !canFetch.value || !disputeId) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const json = await fn({ signal }, { path: { disputePspReference: disputeId } });
            if (!signal.aborted) {
                data.value = json as IDisputeDetail;
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as DisputeError;
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
            }
        }
    }

    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        return props().disputeId;
    });

    watch(
        fetchKey,
        newKey => {
            if (!newKey) return;
            data.value = undefined;
            void runFetch();
        },
        { immediate: true }
    );

    onUnmounted(() => {
        if (abortController) abortController.abort();
    });

    return { data, error, isFetching, refetch: runFetch } as const;
}
