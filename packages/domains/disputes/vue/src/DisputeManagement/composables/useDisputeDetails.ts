import { computed, onUnmounted, ref, watch } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { useDisputesContext } from '../../integration/context';

interface UseDisputeDetailsProps {
    disputeId: string;
    fetchEnabled: boolean;
}

export type DisputeError = Error & {
    errorCode?: string;
    requestId?: string;
};

export function useDisputeDetails(props: () => UseDisputeDetailsProps) {
    const { runtime } = useDisputesContext();
    const data = ref<IDisputeDetail | undefined>(undefined);
    const error = ref<DisputeError | undefined>(undefined);
    const isFetching = ref(false);
    let abortController: AbortController | null = null;

    const canFetch = computed(() => props().fetchEnabled);

    async function runFetch() {
        const { disputeId } = props();
        if (!canFetch.value || !disputeId) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const json = await runtime.getDispute({ disputePspReference: disputeId, signal });
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
            abortController?.abort();
            abortController = null;
            if (!newKey) {
                data.value = undefined;
                error.value = undefined;
                isFetching.value = false;
                return;
            }
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
