import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useConfigContext } from '@integration-components/core/vue';
import { useAccountBalances } from './useAccountBalances';

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: vi.fn(),
}));

describe('useAccountBalances', () => {
    const mockUseConfigContext = vi.mocked(useConfigContext);

    const configureBalancesEndpoint = (getBalances: ReturnType<typeof vi.fn>) => {
        mockUseConfigContext.mockReturnValue({
            endpoints: { getBalances },
        } as unknown as ReturnType<typeof useConfigContext>);
    };

    const createHook = (initialBalanceAccountId?: string) => {
        const balanceAccountId = ref(initialBalanceAccountId);
        const scope = effectScope();
        const accountBalances = scope.run(() => useAccountBalances(() => balanceAccountId.value))!;

        return { accountBalances, balanceAccountId, scope };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('loads balances and enables refresh after the initial request', async () => {
        const balances = [{ currency: 'USD', reservedValue: 30, value: 150 }];
        const getBalances = vi.fn().mockResolvedValue({ data: balances });
        configureBalancesEndpoint(getBalances);

        const { accountBalances, scope } = createHook('balance-account');

        await vi.waitFor(() => expect(accountBalances.balances.value).toEqual(balances));

        expect(getBalances).toHaveBeenCalledOnce();
        expect(getBalances.mock.lastCall?.[1]?.path).toEqual({ balanceAccountId: 'balance-account' });
        expect(accountBalances.error.value).toBeUndefined();
        expect(accountBalances.isAvailable.value).toBe(true);
        expect(accountBalances.isFetching.value).toBe(false);
        expect(accountBalances.canRefresh.value).toBe(true);

        scope.stop();
    });

    test('fetches balances again when refreshed', async () => {
        const initialBalances = [{ currency: 'USD', reservedValue: 30, value: 150 }];
        const refreshedBalances = [{ currency: 'EUR', reservedValue: 20, value: 120 }];
        const getBalances = vi.fn().mockResolvedValueOnce({ data: initialBalances }).mockResolvedValueOnce({ data: refreshedBalances });
        configureBalancesEndpoint(getBalances);

        const { accountBalances, scope } = createHook('balance-account');

        await vi.waitFor(() => expect(accountBalances.balances.value).toEqual(initialBalances));

        accountBalances.refresh();

        await vi.waitFor(() => expect(accountBalances.balances.value).toEqual(refreshedBalances));
        expect(getBalances).toHaveBeenCalledTimes(2);
        expect(getBalances.mock.lastCall?.[1]?.path).toEqual({ balanceAccountId: 'balance-account' });

        scope.stop();
    });

    test('recovers from a failed request when refreshed', async () => {
        const balances = [{ currency: 'USD', reservedValue: 30, value: 150 }];
        const error = new Error('Balances unavailable');
        const getBalances = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce({ data: balances });
        configureBalancesEndpoint(getBalances);

        const { accountBalances, scope } = createHook('balance-account');

        await vi.waitFor(() => expect(accountBalances.error.value).toBe(error));
        expect(accountBalances.canRefresh.value).toBe(true);

        accountBalances.refresh();

        await vi.waitFor(() => expect(accountBalances.balances.value).toEqual(balances));
        expect(accountBalances.error.value).toBeUndefined();
        expect(getBalances).toHaveBeenCalledTimes(2);

        scope.stop();
    });

    test('does not refresh without an available endpoint or balance account', async () => {
        const getBalances = vi.fn().mockResolvedValue({ data: [] });
        configureBalancesEndpoint(getBalances);

        const { accountBalances, scope } = createHook();

        await vi.waitFor(() => expect(accountBalances.isFetching.value).toBe(false));

        accountBalances.refresh();

        expect(getBalances).not.toHaveBeenCalled();
        expect(accountBalances.canRefresh.value).toBe(false);

        scope.stop();
    });

    test('aborts a stale request when the balance account changes', async () => {
        const getBalances = vi.fn().mockResolvedValue({ data: [] });
        configureBalancesEndpoint(getBalances);

        const { balanceAccountId, scope } = createHook('first-account');

        await vi.waitFor(() => expect(getBalances).toHaveBeenCalledOnce());
        const firstSignal = getBalances.mock.calls[0]?.[0]?.signal;

        balanceAccountId.value = 'second-account';

        await vi.waitFor(() => expect(getBalances).toHaveBeenCalledTimes(2));
        expect(firstSignal?.aborted).toBe(true);
        expect(getBalances.mock.lastCall?.[1]?.path).toEqual({ balanceAccountId: 'second-account' });

        scope.stop();
    });

    test('aborts an in-flight request when disposed', async () => {
        const getBalances = vi.fn().mockReturnValue(new Promise(() => undefined));
        configureBalancesEndpoint(getBalances);

        const { scope } = createHook('balance-account');

        await vi.waitFor(() => expect(getBalances).toHaveBeenCalledOnce());
        const signal = getBalances.mock.calls[0]?.[0]?.signal;

        scope.stop();

        expect(signal?.aborted).toBe(true);
    });
});
