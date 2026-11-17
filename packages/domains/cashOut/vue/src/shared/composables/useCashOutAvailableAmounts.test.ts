import { effectScope } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ICashOutAvailableAmounts, ISessionAccount } from '@integration-components/types';
import { useCashOutAvailableAmounts } from './useCashOutAvailableAmounts';

const endpoints: { getAccounts?: ReturnType<typeof vi.fn>; getCashOutAvailableAmounts?: ReturnType<typeof vi.fn> } = {};

const core: { externalErrorHandler?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
    useCoreContext: () => core,
}));

const ACCOUNT_HOLDER: ISessionAccount = { accountKey: 'BalanceAccountHolder.AH1', accountType: 'BalanceAccountHolder' };
const BALANCE_ACCOUNT: ISessionAccount = { accountKey: 'BalanceAccount.BA1', accountType: 'BalanceAccount' };

const AVAILABLE_AMOUNTS: ICashOutAvailableAmounts = {
    balanceAccounts: [
        { balanceAccountId: 'BA1', availableForCashOut: { value: 22000, currency: 'USD' } },
        { balanceAccountId: 'BA2', availableForCashOut: { value: 53500, currency: 'EUR' } },
    ],
};

const mountAvailableAmounts = () => {
    const scope = effectScope();
    const state = scope.run(() => useCashOutAvailableAmounts())!;
    return { state, stop: () => scope.stop() };
};

const requestedAccountKeys = () => endpoints.getCashOutAvailableAmounts!.mock.calls.map(([, params]) => params?.path?.accountKey);

describe('useCashOutAvailableAmounts', () => {
    beforeEach(() => {
        core.externalErrorHandler = vi.fn();
        endpoints.getAccounts = vi.fn().mockResolvedValue({ data: [ACCOUNT_HOLDER] });
        endpoints.getCashOutAvailableAmounts = vi.fn().mockResolvedValue(AVAILABLE_AMOUNTS);
    });

    test('should request the available amounts for the account holder of the session, and give them by balance account', async () => {
        const { state, stop } = mountAvailableAmounts();

        await vi.waitFor(() => expect(state.availableAmounts.value.size).toBe(2));
        expect(endpoints.getAccounts).toHaveBeenCalledOnce();
        expect(requestedAccountKeys()).toEqual(['BalanceAccountHolder.AH1']);
        expect(state.availableAmounts.value.get('BA1')).toEqual({ value: 22000, currency: 'USD' });
        expect(state.availableAmounts.value.get('BA2')).toEqual({ value: 53500, currency: 'EUR' });
        expect(state.hasAvailableAmounts.value).toBe(true);

        stop();
    });

    // A session for a balance account has only that one, so nothing to pick from.
    test('should not request them for a session for a balance account', async () => {
        endpoints.getAccounts = vi.fn().mockResolvedValue({ data: [BALANCE_ACCOUNT] });
        const { state, stop } = mountAvailableAmounts();

        await vi.waitFor(() => expect(endpoints.getAccounts).toHaveBeenCalledOnce());
        await Promise.resolve();
        await Promise.resolve();

        expect(endpoints.getCashOutAvailableAmounts).not.toHaveBeenCalled();
        expect(state.hasAvailableAmounts.value).toBe(false);

        stop();
    });

    test('should leave out a balance account without an amount', async () => {
        endpoints.getCashOutAvailableAmounts = vi.fn().mockResolvedValue({
            balanceAccounts: [
                { balanceAccountId: 'BA1', availableForCashOut: null },
                { balanceAccountId: 'BA2', availableForCashOut: { value: 53500, currency: 'EUR' } },
            ],
        });
        const { state, stop } = mountAvailableAmounts();

        await vi.waitFor(() => expect(state.availableAmounts.value.has('BA2')).toBe(true));
        expect(state.availableAmounts.value.has('BA1')).toBe(false);
        expect(state.hasAvailableAmounts.value).toBe(true);

        stop();
    });

    test.each([
        ['the available amounts', () => delete endpoints.getCashOutAvailableAmounts],
        ['the account of the session', () => delete endpoints.getAccounts],
    ])('should request nothing without the endpoint for %s, such as for a session without it', async (_, removeEndpoint) => {
        removeEndpoint();
        const { state, stop } = mountAvailableAmounts();
        await Promise.resolve();

        expect(endpoints.getAccounts?.mock.calls ?? []).toHaveLength(0);
        expect(endpoints.getCashOutAvailableAmounts?.mock.calls ?? []).toHaveLength(0);
        expect(state.hasAvailableAmounts.value).toBe(false);

        stop();
    });

    // The amounts only add to the balance accounts to pick from, so the component works the same without them.
    test.each([
        ['the account of the session', () => (endpoints.getAccounts = vi.fn().mockRejectedValue(new Error('Internal error')))],
        ['the available amounts', () => (endpoints.getCashOutAvailableAmounts = vi.fn().mockRejectedValue(new Error('Internal error')))],
    ])('should have no amounts when %s fails to load, without reporting it to the onError of the SDK', async (_, fail) => {
        fail();
        const { state, stop } = mountAvailableAmounts();

        await vi.waitFor(() => expect(endpoints.getAccounts).toHaveBeenCalledOnce());
        await new Promise(resolve => setTimeout(resolve));

        expect(state.availableAmounts.value.size).toBe(0);
        expect(state.hasAvailableAmounts.value).toBe(false);
        expect(core.externalErrorHandler).not.toHaveBeenCalled();

        stop();
    });

    // Such as the request in the Overview's modal, which opens after the Overview loaded them.
    test('should share the amounts between the components of a session, requesting them once', async () => {
        const overview = mountAvailableAmounts();
        await vi.waitFor(() => expect(overview.state.availableAmounts.value.size).toBe(2));

        const modal = mountAvailableAmounts();

        expect(modal.state.availableAmounts.value.get('BA1')).toEqual({ value: 22000, currency: 'USD' });
        expect(endpoints.getAccounts).toHaveBeenCalledOnce();
        expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledOnce();

        modal.stop();
        overview.stop();
    });

    test('should not request them again for a component that mounts while they are being requested', async () => {
        const first = mountAvailableAmounts();
        const second = mountAvailableAmounts();

        await vi.waitFor(() => expect(first.state.availableAmounts.value.size).toBe(2));
        expect(endpoints.getAccounts).toHaveBeenCalledOnce();
        expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledOnce();

        second.stop();
        first.stop();
    });

    test('should give every component of the session what a refresh in one of them loaded', async () => {
        const overview = mountAvailableAmounts();
        const modal = mountAvailableAmounts();
        await vi.waitFor(() => expect(overview.state.availableAmounts.value.size).toBe(2));
        endpoints.getCashOutAvailableAmounts!.mockResolvedValueOnce({
            balanceAccounts: [{ balanceAccountId: 'BA1', availableForCashOut: { value: 12000, currency: 'USD' } }],
        });

        modal.state.refreshAvailableAmounts();

        await vi.waitFor(() => expect(overview.state.availableAmounts.value.get('BA1')).toEqual({ value: 12000, currency: 'USD' }));
        expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2);
        // The account of the session doesn't change, so it is not asked for again.
        expect(endpoints.getAccounts).toHaveBeenCalledOnce();

        modal.stop();
        overview.stop();
    });

    // When refreshes overlap, an older response arriving last must not replace a newer one.
    test('should keep the amounts of the latest request when an earlier one arrives after it', async () => {
        const { state, stop } = mountAvailableAmounts();
        await vi.waitFor(() => expect(state.availableAmounts.value.size).toBe(2));
        let resolveEarlier!: (amounts: ICashOutAvailableAmounts) => void;
        endpoints.getCashOutAvailableAmounts!.mockReturnValueOnce(new Promise(resolve => (resolveEarlier = resolve))).mockResolvedValueOnce({
            balanceAccounts: [{ balanceAccountId: 'BA1', availableForCashOut: { value: 3000, currency: 'USD' } }],
        });

        state.refreshAvailableAmounts();
        state.refreshAvailableAmounts();
        await vi.waitFor(() => expect(state.availableAmounts.value.get('BA1')).toEqual({ value: 3000, currency: 'USD' }));
        resolveEarlier({ balanceAccounts: [{ balanceAccountId: 'BA1', availableForCashOut: { value: 9000, currency: 'USD' } }] });
        await new Promise(resolve => setTimeout(resolve));

        expect(state.availableAmounts.value.get('BA1')).toEqual({ value: 3000, currency: 'USD' });

        stop();
    });

    test('should request them again when refreshed, keeping the previous ones until the new ones arrive', async () => {
        const { state, stop } = mountAvailableAmounts();
        await vi.waitFor(() => expect(state.availableAmounts.value.size).toBe(2));
        let resolveRefresh!: (amounts: ICashOutAvailableAmounts) => void;
        endpoints.getCashOutAvailableAmounts!.mockReturnValueOnce(new Promise(resolve => (resolveRefresh = resolve)));

        state.refreshAvailableAmounts();
        await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
        expect(state.availableAmounts.value.get('BA1')).toEqual({ value: 22000, currency: 'USD' });

        resolveRefresh({ balanceAccounts: [{ balanceAccountId: 'BA1', availableForCashOut: { value: 12000, currency: 'USD' } }] });
        await vi.waitFor(() => expect(state.availableAmounts.value.get('BA1')).toEqual({ value: 12000, currency: 'USD' }));
        expect(state.availableAmounts.value.has('BA2')).toBe(false);

        stop();
    });

    test('should not request them when refreshed for a session for a balance account', async () => {
        endpoints.getAccounts = vi.fn().mockResolvedValue({ data: [BALANCE_ACCOUNT] });
        const { state, stop } = mountAvailableAmounts();
        await vi.waitFor(() => expect(endpoints.getAccounts).toHaveBeenCalledOnce());

        state.refreshAvailableAmounts();
        await new Promise(resolve => setTimeout(resolve));

        expect(endpoints.getCashOutAvailableAmounts).not.toHaveBeenCalled();

        stop();
    });
});
