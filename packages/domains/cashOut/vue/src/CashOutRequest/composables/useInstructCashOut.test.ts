import { effectScope } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ICashOutResponse } from '@integration-components/types';
import { useInstructCashOut } from './useInstructCashOut';

const endpoints: { instructCashOut?: ReturnType<typeof vi.fn> } = {};
const core: { externalErrorHandler?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
    useCoreContext: () => core,
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
        core.externalErrorHandler = vi.fn();
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

    test('should send the reference and the description given by the integration', async () => {
        const { state, stop } = renderInstructCashOut();

        await state.instructCashOut({ ...PARAMS, referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' });

        expect(endpoints.instructCashOut).toHaveBeenCalledWith(
            expect.objectContaining({
                body: {
                    amount: 1000,
                    currency: 'EUR',
                    counterparty: { transferInstrumentId: 'TI1' },
                    description: 'Weekly cashOut',
                    referenceForBeneficiary: 'REF123',
                },
            }),
            { path: { accountKey: 'BA1' } }
        );

        stop();
    });

    test('should report a failed cashOut to the onError of the SDK', async () => {
        const error = new Error('failed');
        endpoints.instructCashOut!.mockRejectedValue(error);
        const { state, stop } = renderInstructCashOut();

        await state.instructCashOut(PARAMS);

        expect(core.externalErrorHandler).toHaveBeenCalledWith(error);

        stop();
    });

    test('should not report a cashOut that succeeds', async () => {
        const { state, stop } = renderInstructCashOut();

        await state.instructCashOut(PARAMS);

        expect(core.externalErrorHandler).not.toHaveBeenCalled();

        stop();
    });

    test('should fail quietly when the SDK has no onError', async () => {
        core.externalErrorHandler = undefined;
        endpoints.instructCashOut!.mockRejectedValue(new Error('failed'));
        const { state, stop } = renderInstructCashOut();

        await expect(state.instructCashOut(PARAMS)).resolves.toBeUndefined();

        stop();
    });

    test('should leave out an empty reference and description, so the API generates them', async () => {
        const { state, stop } = renderInstructCashOut();

        await state.instructCashOut({ ...PARAMS, referenceForBeneficiary: '', transferDescription: '' });

        const [[{ body }]] = endpoints.instructCashOut!.mock.calls as [[{ body: Record<string, unknown> }]];
        expect(JSON.parse(JSON.stringify(body))).toEqual({ amount: 1000, currency: 'EUR', counterparty: { transferInstrumentId: 'TI1' } });

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
