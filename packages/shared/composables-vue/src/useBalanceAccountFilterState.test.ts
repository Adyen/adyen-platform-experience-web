import { effectScope, nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import { useBalanceAccountFilterState } from './useBalanceAccountFilterState';

test('replaces stale balance-account selections but preserves a configured sentinel', async () => {
    const accounts = ref([{ id: 'account-a', description: 'Account A' }, { id: 'account-b' }]);
    const scope = effectScope();

    const balanceAccount = scope.run(() =>
        useBalanceAccountFilterState({
            balanceAccounts: () => accounts.value,
            initialValue: 'stale-account',
            preserveValue: value => value === 'all-accounts',
        })
    )!;

    expect(balanceAccount.selectedBalanceAccountId.value).toBe('account-a');
    expect(balanceAccount.hasMultipleBalanceAccounts.value).toBe(true);
    expect(balanceAccount.balanceAccountOptions.value).toEqual([
        { label: 'Account A', value: 'account-a', description: 'account-a' },
        { label: 'account-b', value: 'account-b', description: undefined },
    ]);

    balanceAccount.selectedBalanceAccountId.value = 'account-b';
    accounts.value = [{ id: 'account-a' }];
    await nextTick();

    expect(balanceAccount.selectedBalanceAccountId.value).toBe('account-a');

    balanceAccount.selectedBalanceAccountId.value = 'all-accounts';
    accounts.value = [{ id: 'account-c' }];
    await nextTick();

    expect(balanceAccount.selectedBalanceAccountId.value).toBe('all-accounts');

    scope.stop();
});
