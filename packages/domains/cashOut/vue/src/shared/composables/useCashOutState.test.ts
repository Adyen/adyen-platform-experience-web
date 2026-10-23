import { effectScope } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutState } from './useCashOutState';

const endpoints: { getBalanceAccounts?: ReturnType<typeof vi.fn>; getCashOutEligibility?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
}));

const eligibilityOf = (value: number) =>
    ({
        isCashoutAvailable: true,
        availableForCashOutBalance: { value, currency: 'USD' },
        unavailableReasons: [],
    }) as unknown as ICashOutEligibility;

const ELIGIBILITY_BY_BALANCE_ACCOUNT: Record<string, ICashOutEligibility> = { BA1: eligibilityOf(100), BA2: eligibilityOf(200) };

const renderCashOutState = (...args: Parameters<typeof useCashOutState>) => {
    const scope = effectScope();
    const state = scope.run(() => useCashOutState(...args))!;
    return { state, stop: () => scope.stop() };
};

const requestedBalanceAccountIds = () =>
    endpoints.getCashOutEligibility!.mock.calls.map(([, params]) => (params as { path: { accountKey: string } }).path.accountKey);

describe('useCashOutState', () => {
    beforeEach(() => {
        // A new endpoint for every test, because the balance accounts are cached per endpoint.
        endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({ data: [{ id: 'BA1' }, { id: 'BA2' }] });
        endpoints.getCashOutEligibility = vi.fn(async (_: unknown, { path }: { path: { accountKey: string } }) => {
            return ELIGIBILITY_BY_BALANCE_ACCOUNT[path.accountKey];
        });
    });

    test('should fetch the eligibility of the first balance account', async () => {
        const { state, stop } = renderCashOutState();

        expect(state.shellState.value).toBe('loading');

        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
        expect(state.selectedBalanceAccountId.value).toBe('BA1');
        expect(state.eligibility.value).toEqual(ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1);
        expect(requestedBalanceAccountIds()).toEqual(['BA1']);

        stop();
    });

    test('should use the given eligibility of the given balance account without fetching it', async () => {
        const eligibility = eligibilityOf(300);
        const { state, stop } = renderCashOutState({ balanceAccountId: 'BA2', eligibility });

        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
        expect(state.selectedBalanceAccountId.value).toBe('BA2');
        expect(state.eligibility.value).toBe(eligibility);
        expect(endpoints.getCashOutEligibility).not.toHaveBeenCalled();

        stop();
    });

    test('should fetch the eligibility when another balance account is selected', async () => {
        const { state, stop } = renderCashOutState({ balanceAccountId: 'BA2', eligibility: eligibilityOf(300) });
        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

        state.selectedBalanceAccountId.value = 'BA1';

        await vi.waitFor(() => expect(state.eligibility.value).toEqual(ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1));
        expect(state.shellState.value).toBe('ready');
        expect(requestedBalanceAccountIds()).toEqual(['BA1']);

        stop();
    });

    test('should be in an error state when the eligibility fails to load', async () => {
        endpoints.getCashOutEligibility!.mockRejectedValue(new Error('error'));
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('error'));
        expect(state.errorInfo.value.refreshComponent).toBe(true);

        stop();
    });

    test('should be in an error state when the balance accounts fail to load', async () => {
        endpoints.getBalanceAccounts!.mockRejectedValue(new Error('error'));
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('error'));

        stop();
    });

    test('should be in an error state when there are no balance accounts', async () => {
        endpoints.getBalanceAccounts!.mockResolvedValue({ data: [] });
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('error'));
        expect(endpoints.getCashOutEligibility).not.toHaveBeenCalled();

        stop();
    });
});
