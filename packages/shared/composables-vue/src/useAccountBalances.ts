import { ref, computed, watch, onUnmounted } from 'vue';
import { isFunction } from '@integration-components/utils';
import type { IBalance } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/vue';

/**
 * Vue composable counterpart of the Preact `useAccountBalances` hook. Fetches the list of balances
 * for a given balance account from the `getBalances` endpoint.
 */
export function useAccountBalances(balanceAccountId: () => string | undefined) {
    const config = useConfigContext();

    const balances = ref<readonly Readonly<IBalance>[]>([]);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);

    let abortController: AbortController | null = null;

    const getBalances = computed(() => config.endpoints.getBalances);
    const isAvailable = computed(() => isFunction(getBalances.value));

    async function fetchBalances(id: string) {
        const fn = getBalances.value;
        if (!isFunction(fn)) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const json = await fn({ signal }, { path: { balanceAccountId: id } });
            if (!signal.aborted) {
                balances.value = Array.isArray(json?.data) ? (json.data as IBalance[]) : [];
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
                balances.value = [];
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
            }
        }
    }

    watch(
        [getBalances, balanceAccountId],
        ([fn, id]) => {
            if (isFunction(fn) && id) {
                void fetchBalances(id);
            } else {
                if (abortController) {
                    abortController.abort();
                    abortController = null;
                }
                balances.value = [];
                isFetching.value = false;
            }
        },
        { immediate: true }
    );

    onUnmounted(() => abortController?.abort());

    return {
        balances,
        error,
        isFetching,
        isAvailable,
    } as const;
}

export default useAccountBalances;
