import { computed, ref, watch } from 'vue';

interface BalanceAccount {
    id: string;
    description?: string;
}

interface UseBalanceAccountFilterStateOptions<T extends BalanceAccount> {
    balanceAccounts: () => readonly T[] | undefined;
    initialValue?: string;
    preserveValue?: (value: string | undefined) => boolean;
}

export function useBalanceAccountFilterState<T extends BalanceAccount>({
    balanceAccounts,
    initialValue,
    preserveValue,
}: UseBalanceAccountFilterStateOptions<T>) {
    const selectedBalanceAccountId = ref<string | undefined>(initialValue);
    const hasMultipleBalanceAccounts = computed(() => (balanceAccounts()?.length ?? 0) > 1);

    const balanceAccountOptions = computed(() =>
        (balanceAccounts() ?? []).map(account => ({
            label: account.description || account.id,
            value: account.id,
            description: account.description ? account.id : undefined,
        }))
    );

    watch(
        balanceAccounts,
        accounts => {
            const value = selectedBalanceAccountId.value;
            if (accounts?.length && !preserveValue?.(value) && !accounts.some(account => account.id === selectedBalanceAccountId.value)) {
                selectedBalanceAccountId.value = accounts[0]?.id;
            }
        },
        { immediate: true }
    );

    return { selectedBalanceAccountId, hasMultipleBalanceAccounts, balanceAccountOptions } as const;
}

export default useBalanceAccountFilterState;
