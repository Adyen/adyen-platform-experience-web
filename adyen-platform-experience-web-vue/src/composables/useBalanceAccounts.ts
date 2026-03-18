import { ref, computed, watch } from 'vue';
import { useConfigContext } from '../core/ConfigContext';
import { isFunction } from '../utils';
import type { IBalanceAccountBase } from '../types';

const cache = new WeakMap<(...args: any[]) => any, IBalanceAccountBase[]>();

export function useBalanceAccounts(balanceAccountId?: () => string | undefined) {
    const { endpoints } = useConfigContext();

    const balanceAccountsFromCache = ref<IBalanceAccountBase[] | undefined>(undefined);
    const fetchedData = ref<{ data: IBalanceAccountBase[] } | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<Error | undefined>(undefined);

    const getBalanceAccounts = computed(() => endpoints.getBalanceAccounts);

    // Initialize cache
    const endpoint = getBalanceAccounts.value;
    if (endpoint && isFunction(endpoint)) {
        const cached = cache.get(endpoint);
        if (cached) balanceAccountsFromCache.value = cached;
    }

    const canFetch = computed(() => !balanceAccountsFromCache.value && isFunction(getBalanceAccounts.value));

    async function fetchBalanceAccounts() {
        const fn = getBalanceAccounts.value;
        if (!isFunction(fn) || !canFetch.value) return;

        isFetching.value = true;
        error.value = undefined;

        try {
            const result = await fn({});
            fetchedData.value = result;
            if (result?.data && isFunction(fn)) {
                cache.set(fn, result.data);
                balanceAccountsFromCache.value = result.data;
            }
        } catch (e) {
            error.value = e as Error;
        } finally {
            isFetching.value = false;
        }
    }

    // Fetch on mount if needed
    watch(
        canFetch,
        canFetchNow => {
            if (canFetchNow) fetchBalanceAccounts();
        },
        { immediate: true }
    );

    const allBalanceAccounts = computed(() => balanceAccountsFromCache.value ?? fetchedData.value?.data);

    const balanceAccounts = computed(() => {
        const id = balanceAccountId?.();
        return allBalanceAccounts.value?.filter(account => !id || id === account.id);
    });

    const isBalanceAccountIdWrong = computed(() => {
        const id = balanceAccountId?.();
        return !!id && !!allBalanceAccounts.value?.length && balanceAccounts.value?.length === 0;
    });

    return { balanceAccounts, isBalanceAccountIdWrong, isFetching, error };
}
