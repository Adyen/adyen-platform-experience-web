import { ref, computed, watch, onUnmounted } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { IPayoutDetails } from '@integration-components/types';

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
    const config = useConfigContext();

    const data = ref<IPayoutDetails | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);
    let abortController: AbortController | null = null;

    const getPayout = computed(() => config.endpoints.getPayout);
    const canFetch = computed(() => isFunction(getPayout.value) && props().fetchEnabled);

    async function runFetch() {
        const fn = getPayout.value;
        const { balanceAccountId, createdAt } = props();
        if (!isFunction(fn) || !canFetch.value || !balanceAccountId || !createdAt) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const json = await fn({ signal }, { query: { balanceAccountId, createdAt } });
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
            if (!newKey) return;
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
