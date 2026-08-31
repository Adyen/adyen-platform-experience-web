import { ref, computed, watch, onUnmounted } from 'vue';
import type { IPayoutDetails } from '@integration-components/types';
import { usePayoutsContext } from '../../integration/context';

interface UsePayoutDetailsProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    createdAt: string | undefined;
}

/**
 * Fetches a single payout's details via `config.endpoints.getPayout` and exposes
 * reactive `data / error / isFetching` refs. Automatically re-fetches when
 * `balanceAccountId` or `createdAt` change and aborts in-flight requests on
 * update or unmount.
 */
export function usePayoutDetails(props: () => UsePayoutDetailsProps) {
    const { runtime } = usePayoutsContext();

    const data = ref<IPayoutDetails | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);
    let abortController: AbortController | null = null;

    const canFetch = computed(() => props().fetchEnabled);

    async function runFetch() {
        const { balanceAccountId, createdAt } = props();
        if (!canFetch.value || !balanceAccountId || !createdAt) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const json = await runtime.getPayout({ balanceAccountId, createdAt, signal });
            if (!signal.aborted) {
                data.value = json as IPayoutDetails;
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

    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        const { balanceAccountId, createdAt } = props();
        return JSON.stringify({ balanceAccountId, createdAt });
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

    return { data, error, isFetching } as const;
}
