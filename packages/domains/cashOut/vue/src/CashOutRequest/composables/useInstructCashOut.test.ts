import { effectScope } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ICashOutResponse } from '@integration-components/types';
import { useInstructCashOut } from './useInstructCashOut';

const endpoints: { instructCashOut?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
}));

const CASH_OUT: ICashOutResponse = {
    id: 'CO1',
    balanceAccount: 'BA1',
    amount: { value: 1000, currency: 'EUR' },
    fee: { value: 65, currency: 'EUR' },
    counterparty: { transferInstrumentId: 'TI1' },
};

const PARAMS = { balanceAccountId: 'BA1', amount: { value: 1000, currency: 'EUR' }, transferInstrumentId: 'TI1' };

const renderInstructCashOut = () => {
    const scope = effectScope();
    const state = scope.run(() => useInstructCashOut())!;
    return { state, stop: () => scope.stop() };
};

describe('useInstructCashOut', () => {
    beforeEach(() => {
        endpoints.instructCashOut = vi.fn(async () => CASH_OUT);
    });

    test('should instruct the cashOut of the amount to the transfer instrument and return it', async () => {
        const { state, stop } = renderInstructCashOut();

        const pending = state.instructCashOut(PARAMS);
        expect(state.isInstructing.value).toBe(true);

        await expect(pending).resolves.toEqual(CASH_OUT);
        expect(state.isInstructing.value).toBe(false);
        expect(endpoints.instructCashOut).toHaveBeenCalledWith(
            {
                body: { amount: 1000, currency: 'EUR', counterparty: { transferInstrumentId: 'TI1' } },
                contentType: 'application/json',
                signal: expect.any(AbortSignal),
            },
            { path: { accountKey: 'BA1' } }
        );

        stop();
    });

    test('should resolve without a cashOut when it fails', async () => {
        endpoints.instructCashOut!.mockRejectedValue(new Error('failed'));
        const { state, stop } = renderInstructCashOut();

        await expect(state.instructCashOut(PARAMS)).resolves.toBeUndefined();
        expect(state.isInstructing.value).toBe(false);

        stop();
    });

    test('should tell whether cashOuts can be instructed', () => {
        const { state, stop } = renderInstructCashOut();
        expect(state.canInstructCashOut.value).toBe(true);
        stop();

        endpoints.instructCashOut = undefined;
        const { state: stateWithoutEndpoint, stop: stopWithoutEndpoint } = renderInstructCashOut();
        expect(stateWithoutEndpoint.canInstructCashOut.value).toBe(false);
        stopWithoutEndpoint();
    });
});
