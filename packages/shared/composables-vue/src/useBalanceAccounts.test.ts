import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useConfigContext } from '@integration-components/core/vue';
import { useBalanceAccounts } from './useBalanceAccounts';

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: vi.fn(),
}));

describe('useBalanceAccounts', () => {
    const mockUseConfigContext = vi.mocked(useConfigContext);
    const accounts = [
        { id: 'BA1', defaultCurrencyCode: 'EUR', timeZone: 'Europe/Amsterdam' },
        { id: 'BA2', defaultCurrencyCode: 'USD', timeZone: 'America/New_York' },
    ];

    const createHook = (getBalanceAccounts: ReturnType<typeof vi.fn>, initialId?: string, initiallyEnabled = true) => {
        mockUseConfigContext.mockReturnValue({
            endpoints: { getBalanceAccounts },
        } as unknown as ReturnType<typeof useConfigContext>);

        const balanceAccountId = ref(initialId);
        const enabled = ref(initiallyEnabled);
        const scope = effectScope();
        const result = scope.run(() =>
            useBalanceAccounts(
                () => balanceAccountId.value,
                () => enabled.value
            )
        )!;

        return { balanceAccountId, enabled, result, scope };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('fetches balance accounts and filters them by ID', async () => {
        const getBalanceAccounts = vi.fn().mockResolvedValue({ data: accounts });
        const { balanceAccountId, result, scope } = createHook(getBalanceAccounts, 'BA1');

        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));

        expect(getBalanceAccounts).toHaveBeenCalledOnce();
        expect(result.balanceAccounts.value).toEqual([accounts[0]]);
        expect(result.error.value).toBeUndefined();
        expect(result.isBalanceAccountIdWrong.value).toBe(false);

        balanceAccountId.value = 'INVALID';
        expect(result.balanceAccounts.value).toEqual([]);
        expect(result.isBalanceAccountIdWrong.value).toBe(true);

        scope.stop();
    });

    test('does not mark an ID invalid when the endpoint returns no accounts', async () => {
        const getBalanceAccounts = vi.fn().mockResolvedValue({ data: [] });
        const { result, scope } = createHook(getBalanceAccounts, 'BA1');

        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));

        expect(result.balanceAccounts.value).toEqual([]);
        expect(result.isBalanceAccountIdWrong.value).toBe(false);

        scope.stop();
    });

    test('exposes fetch errors', async () => {
        const error = new Error('Unable to fetch balance accounts');
        const getBalanceAccounts = vi.fn().mockRejectedValue(error);
        const { result, scope } = createHook(getBalanceAccounts);

        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));

        expect(result.error.value).toBe(error);
        expect(result.balanceAccounts.value).toBeUndefined();

        scope.stop();
    });

    test('does not fetch while disabled or without an endpoint', async () => {
        const getBalanceAccounts = vi.fn().mockResolvedValue({ data: accounts });
        const { enabled, result, scope } = createHook(getBalanceAccounts, undefined, false);

        expect(result.isFetching.value).toBe(false);
        expect(getBalanceAccounts).not.toHaveBeenCalled();

        enabled.value = true;
        await vi.waitFor(() => expect(getBalanceAccounts).toHaveBeenCalledOnce());

        scope.stop();
    });

    test('uses cached accounts for subsequent hook instances', async () => {
        const getBalanceAccounts = vi.fn().mockResolvedValue({ data: accounts });
        const first = createHook(getBalanceAccounts);

        await vi.waitFor(() => expect(first.result.balanceAccounts.value).toEqual(accounts));
        first.scope.stop();

        const second = createHook(getBalanceAccounts);

        expect(second.result.isFetching.value).toBe(false);
        expect(second.result.balanceAccounts.value).toEqual(accounts);
        expect(getBalanceAccounts).toHaveBeenCalledOnce();

        second.scope.stop();
    });
});
