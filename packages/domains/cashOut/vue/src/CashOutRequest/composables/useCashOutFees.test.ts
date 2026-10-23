import { effectScope, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CASH_OUT_FEES_DEBOUNCE_MS } from '@integration-components/cashOut/domain';
import type { ICashOutAmount, ICashOutFees } from '@integration-components/types';
import { useCashOutFees } from './useCashOutFees';

const endpoints: { getCashOutFees?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
}));

type FeesParams = { path: { accountKey: string }; query: { amount: number; currency: string } };

const feesOf = ({ value, currency }: ICashOutAmount): ICashOutFees => ({
    amount: { value, currency },
    fee: { value: 10, currency },
    payoutAmount: { value: value - 10, currency },
});

const renderCashOutFees = (balanceAccountId: string | undefined, amount: ICashOutAmount | undefined) => {
    const balanceAccountIdRef = ref(balanceAccountId);
    const amountRef = ref(amount);
    const scope = effectScope();
    const state = scope.run(() => useCashOutFees({ balanceAccountId: balanceAccountIdRef, amount: amountRef }))!;
    return { amount: amountRef, balanceAccountId: balanceAccountIdRef, state, stop: () => scope.stop() };
};

const requestedFees = () =>
    endpoints.getCashOutFees!.mock.calls.map(([, params]) => {
        const { path, query } = params as FeesParams;
        return { accountKey: path.accountKey, ...query };
    });

describe('useCashOutFees', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        endpoints.getCashOutFees = vi.fn(async (_: unknown, { query }: FeesParams) => feesOf({ value: query.amount, currency: query.currency }));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should fetch the fees of the initial amount right away', async () => {
        const { state, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });

        expect(state.isFetchingFees.value).toBe(true);
        expect(requestedFees()).toEqual([{ accountKey: 'BA1', amount: 1000, currency: 'USD' }]);

        await vi.waitFor(() => expect(state.isFetchingFees.value).toBe(false));
        expect(state.fees.value).toEqual(feesOf({ value: 1000, currency: 'USD' }));

        stop();
    });

    test('should fetch the fees once the amount stops changing', async () => {
        const { amount, state, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });
        await vi.waitFor(() => expect(state.isFetchingFees.value).toBe(false));

        amount.value = { value: 2000, currency: 'USD' };
        await nextTick();
        amount.value = { value: 3000, currency: 'USD' };
        await nextTick();

        expect(state.isFetchingFees.value).toBe(true);
        expect(state.fees.value).toBeUndefined();
        expect(requestedFees()).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(CASH_OUT_FEES_DEBOUNCE_MS);

        expect(requestedFees()).toEqual([
            { accountKey: 'BA1', amount: 1000, currency: 'USD' },
            { accountKey: 'BA1', amount: 3000, currency: 'USD' },
        ]);
        await vi.waitFor(() => expect(state.fees.value).toEqual(feesOf({ value: 3000, currency: 'USD' })));
        expect(state.isFetchingFees.value).toBe(false);

        stop();
    });

    test('should fetch the fees right away when another balance account is selected', async () => {
        const { amount, balanceAccountId, state, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });
        await vi.waitFor(() => expect(state.isFetchingFees.value).toBe(false));

        balanceAccountId.value = 'BA2';
        amount.value = { value: 500, currency: 'EUR' };
        await nextTick();

        expect(requestedFees()).toEqual([
            { accountKey: 'BA1', amount: 1000, currency: 'USD' },
            { accountKey: 'BA2', amount: 500, currency: 'EUR' },
        ]);

        stop();
    });

    test('should fetch the fees right away when the first amount of another balance account arrives after the balance account', async () => {
        const { amount, balanceAccountId, state, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });
        await vi.waitFor(() => expect(state.isFetchingFees.value).toBe(false));

        balanceAccountId.value = 'BA2';
        amount.value = undefined;
        await nextTick();
        amount.value = { value: 500, currency: 'EUR' };
        await nextTick();

        expect(requestedFees()).toEqual([
            { accountKey: 'BA1', amount: 1000, currency: 'USD' },
            { accountKey: 'BA2', amount: 500, currency: 'EUR' },
        ]);

        stop();
    });

    test('should not fetch the fees without an amount', async () => {
        const { amount, state, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });
        await vi.waitFor(() => expect(state.isFetchingFees.value).toBe(false));

        amount.value = undefined;
        await nextTick();
        await vi.advanceTimersByTimeAsync(CASH_OUT_FEES_DEBOUNCE_MS);

        expect(requestedFees()).toHaveLength(1);
        expect(state.fees.value).toBeUndefined();
        expect(state.isFetchingFees.value).toBe(false);

        stop();
    });

    test('should not fetch the fees without a balance account', () => {
        const { state, stop } = renderCashOutFees(undefined, { value: 1000, currency: 'USD' });

        expect(endpoints.getCashOutFees).not.toHaveBeenCalled();
        expect(state.isFetchingFees.value).toBe(false);

        stop();
    });

    test('should expose the error when the fees fail to load', async () => {
        const error = new Error('error');
        endpoints.getCashOutFees!.mockRejectedValue(error);
        const { state, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });

        await vi.waitFor(() => expect(state.feesError.value).toBe(error));
        expect(state.isFetchingFees.value).toBe(false);

        stop();
    });

    test('should not fetch the fees after it is disposed', async () => {
        const { amount, stop } = renderCashOutFees('BA1', { value: 1000, currency: 'USD' });

        amount.value = { value: 2000, currency: 'USD' };
        await nextTick();
        stop();
        await vi.advanceTimersByTimeAsync(CASH_OUT_FEES_DEBOUNCE_MS);

        expect(requestedFees()).toHaveLength(1);
    });
});
