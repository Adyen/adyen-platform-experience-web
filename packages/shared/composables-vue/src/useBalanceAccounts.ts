import { ref, watch, computed } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { IBalanceAccountBase } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/vue';

const cache = new WeakMap<(...args: any[]) => any, IBalanceAccountBase[]>();

/**
 * Vue composable counterpart of the Preact `useBalanceAccounts` hook. Fetches the list of balance
 * accounts once per endpoint (cached by endpoint callable reference), optionally filtering by a
 * target balanceAccountId. Returns reactive refs mirroring the Preact hook's shape.
 */
export function useBalanceAccounts(balanceAccountId?: () => string | undefined, enabled?: () => boolean | undefined) {
    const config = useConfigContext();

    const getBalanceAccounts = computed(() => config.endpoints.getBalanceAccounts);
    const allBalanceAccounts = ref<IBalanceAccountBase[] | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<Error | undefined>(undefined);

    async function runFetch() {
        const fn = getBalanceAccounts.value;
        const isEnabled = (enabled?.() ?? true) !== false;
        if (!isFunction(fn) || !isEnabled) return;

        const cached = cache.get(fn);
        if (cached) {
            allBalanceAccounts.value = cached;
            return;
        }

        isFetching.value = true;
        error.value = undefined;

        try {
            const response = await fn(EMPTY_OBJECT);
            const data = (response?.data ?? []) as IBalanceAccountBase[];
            cache.set(fn, data);
            allBalanceAccounts.value = data;
        } catch (e) {
            error.value = e as Error;
        } finally {
            isFetching.value = false;
        }
    }

    watch([getBalanceAccounts, () => enabled?.()], () => void runFetch(), { immediate: true });

    const balanceAccounts = computed(() => {
        const id = balanceAccountId?.();
        return allBalanceAccounts.value?.filter(account => !id || id === account.id);
    });

    const isBalanceAccountIdWrong = computed(() => {
        const id = balanceAccountId?.();
        return !!id && !!allBalanceAccounts.value?.length && balanceAccounts.value?.length === 0;
    });

    return { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } as const;
}

export default useBalanceAccounts;
