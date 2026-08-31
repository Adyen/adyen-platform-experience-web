import { computed, onScopeDispose, ref, watch } from 'vue';
import type { IBalance } from '@integration-components/types';
import { useTransactionsContext } from '../../integration/context';

export const useTransactionsAccountBalances = (balanceAccountId: () => string | undefined) => {
    const { runtime } = useTransactionsContext();
    const balances = ref<readonly Readonly<IBalance>[]>([]);
    const error = ref<Error>();
    const isFetching = ref(false);
    let controller: AbortController | undefined;

    const canRefresh = computed(() => !isFetching.value && runtime.canGetBalances && !!balanceAccountId());

    const fetchBalances = async (id: string) => {
        controller?.abort();
        const requestController = new AbortController();
        controller = requestController;
        isFetching.value = true;
        error.value = undefined;

        try {
            balances.value = await runtime.getBalances({ balanceAccountId: id, signal: requestController.signal });
        } catch (nextError) {
            if (!requestController.signal.aborted) {
                balances.value = [];
                error.value = nextError as Error;
            }
        } finally {
            if (!requestController.signal.aborted) isFetching.value = false;
        }
    };

    watch(
        [balanceAccountId, () => runtime.canGetBalances],
        ([id, available]) => {
            if (id && available) {
                void fetchBalances(id);
            } else {
                controller?.abort();
                controller = undefined;
                balances.value = [];
                isFetching.value = false;
            }
        },
        { immediate: true }
    );

    onScopeDispose(() => controller?.abort());

    return {
        balances,
        canRefresh,
        error,
        isAvailable: computed(() => runtime.canGetBalances),
        isFetching,
        refresh: () => {
            const id = balanceAccountId();
            if (id && canRefresh.value) void fetchBalances(id);
        },
    } as const;
};
