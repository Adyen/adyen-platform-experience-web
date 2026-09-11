import { ref, watch, computed, onScopeDispose } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { IBalanceAccountBase } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/vue';

const cache = new WeakMap<(...args: any[]) => any, IBalanceAccountBase[]>();
const pendingRequests = new WeakMap<(...args: any[]) => any, Promise<IBalanceAccountBase[]>>();

/**
 * Fetches the list of balance
 * accounts once per endpoint (cached by endpoint callable reference), optionally filtering by a
 * target balanceAccountId. Returns reactive refs for the request state.
 */
export function useBalanceAccounts(balanceAccountId?: () => string | undefined, enabled?: () => boolean | undefined) {
    const config = useConfigContext();

    const getBalanceAccounts = computed(() => config.endpoints.getBalanceAccounts);
    const allBalanceAccounts = ref<IBalanceAccountBase[] | undefined>(undefined);
    const isFetching = ref(false);
    const error = ref<Error | undefined>(undefined);
    let runId = 0;

    async function runFetch() {
        const fn = getBalanceAccounts.value;
        const isEnabled = (enabled?.() ?? true) !== false;
        if (!isFunction(fn) || !isEnabled) return;

        const cached = cache.get(fn);
        if (cached) {
            allBalanceAccounts.value = cached;
            isFetching.value = false;
            error.value = undefined;
            return;
        }

        const thisRun = ++runId;
        isFetching.value = true;
        error.value = undefined;

        try {
            let pending = pendingRequests.get(fn);
            if (!pending) {
                pending = Promise.resolve()
                    .then(() => fn(EMPTY_OBJECT))
                    .then(response => {
                        const data = Array.isArray(response?.data) ? (response.data as IBalanceAccountBase[]) : [];
                        cache.set(fn, data);
                        return data;
                    })
                    .finally(() => pendingRequests.delete(fn));
                pendingRequests.set(fn, pending);
            }

            const data = await pending;
            if (thisRun === runId) allBalanceAccounts.value = data;
        } catch (e) {
            if (thisRun === runId) error.value = e as Error;
        } finally {
            if (thisRun === runId) isFetching.value = false;
        }
    }

    watch(
        [getBalanceAccounts, () => enabled?.()],
        () => {
            runId += 1;
            if (enabled?.() === false || !isFunction(getBalanceAccounts.value)) {
                isFetching.value = false;
                return;
            }
            void runFetch();
        },
        { immediate: true }
    );

    onScopeDispose(() => {
        runId += 1;
    });

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
