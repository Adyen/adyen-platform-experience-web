import { effectScope, reactive, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useConfigContext } from '@integration-components/core/vue';
import { createDeferred } from '@integration-components/utils';
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

    test('does not fetch when the endpoint is unavailable', () => {
        mockUseConfigContext.mockReturnValue({
            endpoints: {},
        } as unknown as ReturnType<typeof useConfigContext>);
        const scope = effectScope();
        const result = scope.run(() => useBalanceAccounts())!;

        expect(result.isFetching.value).toBe(false);
        expect(result.balanceAccounts.value).toBeUndefined();
        expect(result.error.value).toBeUndefined();

        scope.stop();
    });

    test('treats malformed response data as an empty list', async () => {
        const getBalanceAccounts = vi.fn().mockResolvedValue({ data: { id: 'not-an-array' } });
        const { result, scope } = createHook(getBalanceAccounts);

        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));

        expect(result.balanceAccounts.value).toEqual([]);
        expect(result.isBalanceAccountIdWrong.value).toBe(false);

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

    test('shares an in-flight request between hook instances', async () => {
        const request = createDeferred<{ data: typeof accounts }>();
        const getBalanceAccounts = vi.fn().mockReturnValue(request.promise);
        const first = createHook(getBalanceAccounts);
        const second = createHook(getBalanceAccounts);

        await vi.waitFor(() => expect(getBalanceAccounts).toHaveBeenCalledOnce());

        request.resolve({ data: accounts });
        await vi.waitFor(() => {
            expect(first.result.balanceAccounts.value).toEqual(accounts);
            expect(second.result.balanceAccounts.value).toEqual(accounts);
        });

        first.scope.stop();
        second.scope.stop();
    });

    test('ignores a stale response after the endpoint changes', async () => {
        const firstRequest = createDeferred<{ data: typeof accounts }>();
        const secondAccounts = [accounts[1]!];
        const secondRequest = createDeferred<{ data: typeof secondAccounts }>();
        const firstEndpoint = vi.fn().mockReturnValue(firstRequest.promise);
        const secondEndpoint = vi.fn().mockReturnValue(secondRequest.promise);
        const config = reactive({ endpoints: { getBalanceAccounts: firstEndpoint } });
        mockUseConfigContext.mockReturnValue(config as unknown as ReturnType<typeof useConfigContext>);
        const scope = effectScope();
        const result = scope.run(() => useBalanceAccounts())!;

        await vi.waitFor(() => expect(firstEndpoint).toHaveBeenCalledOnce());

        config.endpoints = { getBalanceAccounts: secondEndpoint };
        await vi.waitFor(() => expect(secondEndpoint).toHaveBeenCalledOnce());

        secondRequest.resolve({ data: secondAccounts });
        await vi.waitFor(() => expect(result.balanceAccounts.value).toEqual(secondAccounts));

        firstRequest.resolve({ data: accounts });
        await firstRequest.promise;
        expect(result.balanceAccounts.value).toEqual(secondAccounts);

        scope.stop();
    });
});
