import { effectScope, nextTick, reactive, ref } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { useTransactionsContext } from '../../integration/context';
import { useTransaction } from './useTransaction';

vi.mock('../../integration/context', () => ({
    useTransactionsContext: vi.fn(),
}));

describe('useTransaction', () => {
    test('waits for the runtime to become available before fetching details', async () => {
        const getTransaction = vi.fn().mockResolvedValue({
            balanceAccountId: 'BA1',
            category: 'Payment',
            id: 'TX1',
        });
        const runtime = reactive({
            available: undefined as boolean | undefined,
            getTransaction,
        });
        vi.mocked(useTransactionsContext).mockReturnValue({
            balanceAccounts: { accounts: [] },
            runtime,
        } as unknown as ReturnType<typeof useTransactionsContext>);
        const scope = effectScope();

        const result = scope.run(() => useTransaction(() => 'TX1'))!;

        await nextTick();
        expect(getTransaction).not.toHaveBeenCalled();
        expect(result.fetchingTransaction.value).toBe(false);

        runtime.available = true;

        await vi.waitFor(() => expect(getTransaction).toHaveBeenCalledOnce());
        expect(getTransaction).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
            transactionId: 'TX1',
        });
        await vi.waitFor(() => expect(result.transaction.value?.id).toBe('TX1'));

        scope.stop();
    });

    test('fetches the latest requested id after the runtime becomes available', async () => {
        const getTransaction = vi.fn().mockResolvedValue({
            balanceAccountId: 'BA1',
            category: 'Payment',
            id: 'TX2',
        });
        const runtime = reactive({
            available: undefined as boolean | undefined,
            getTransaction,
        });
        vi.mocked(useTransactionsContext).mockReturnValue({
            balanceAccounts: { accounts: [] },
            runtime,
        } as unknown as ReturnType<typeof useTransactionsContext>);
        const id = ref('TX1');
        const scope = effectScope();

        scope.run(() => useTransaction(() => id.value));
        id.value = 'TX2';
        await nextTick();
        runtime.available = true;

        await vi.waitFor(() => expect(getTransaction).toHaveBeenCalledOnce());
        expect(getTransaction.mock.lastCall?.[0].transactionId).toBe('TX2');

        scope.stop();
    });
});
