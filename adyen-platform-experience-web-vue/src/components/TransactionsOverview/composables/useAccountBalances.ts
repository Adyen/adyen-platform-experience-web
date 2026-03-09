import { ref, computed, watch } from 'vue';
import { useConfigContext } from '../../../core/ConfigContext';
import { isFunction } from '../utils';
import type { IBalance, IBalanceAccountBase } from '../types';

export interface UseAccountBalancesProps {
    balanceAccount?: IBalanceAccountBase;
}

export function useAccountBalances(props: () => UseAccountBalancesProps) {
    const { endpoints } = useConfigContext();

    const data = ref<IBalance[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);
    const fetchTimestamp = ref(performance.now());
    const lastFetchedTimestamp = ref<number | undefined>(undefined);
    let abortController: AbortController | null = null;

    const getBalances = computed(() => endpoints.getBalances);
    const balanceAccountId = computed(() => props().balanceAccount?.id);
    const canGetBalances = computed(() => isFunction(getBalances.value));
    const canFetchBalances = computed(() => canGetBalances.value && !!balanceAccountId.value);
    const shouldFetch = computed(() => canFetchBalances.value && lastFetchedTimestamp.value !== fetchTimestamp.value);

    async function fetchBalances() {
        const fn = getBalances.value;
        if (!isFunction(fn) || !shouldFetch.value) return;

        // Abort previous request
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const path = { balanceAccountId: balanceAccountId.value! };
            const json = await fn({ signal }, { path });
            if (!signal.aborted) {
                data.value = json?.data;
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
                lastFetchedTimestamp.value = fetchTimestamp.value;
            }
        }
    }

    const balances = computed<readonly Readonly<IBalance>[]>(() => (Array.isArray(data.value) ? data.value : []));

    const canRefresh = computed(() => !isFetching.value && canFetchBalances.value);

    const refresh = () => {
        if (canRefresh.value) {
            fetchTimestamp.value = performance.now();
        }
    };

    // Trigger fetch when balance account changes
    watch(balanceAccountId, () => {
        if (balanceAccountId.value) {
            fetchTimestamp.value = performance.now();
        }
    });

    // Trigger fetch when timestamp changes
    watch(
        fetchTimestamp,
        () => {
            fetchBalances();
        },
        { immediate: true }
    );

    return {
        balances,
        error,
        canRefresh,
        refresh,
        isAvailable: canGetBalances,
        isWaiting: computed(() => isFetching.value || (canGetBalances.value && !canFetchBalances.value && !data.value)),
    };
}

export default useAccountBalances;
