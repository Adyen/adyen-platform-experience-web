import { effectScope, nextTick, ref } from 'vue';
import { beforeEach, expect, test, vi } from 'vitest';
import { useTransactionsList } from './useTransactionsList';

const getTransactions = vi.fn();

vi.mock('../../integration/context', () => ({
    useTransactionsContext: () => ({
        runtime: {
            available: true,
            getTransactions,
        },
    }),
}));

vi.mock('@integration-components/composables-vue', () => ({
    useCustomColumnsData: () => ({
        customRecords: ref([]),
        loadingCustomRecords: ref(false),
    }),
}));

beforeEach(() => {
    getTransactions.mockReset();
});

test('does not report filter changes when paginating', async () => {
    getTransactions.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const onFiltersChanged = vi.fn();
    const scope = effectScope();

    const transactions = scope.run(() =>
        useTransactionsList(() => ({
            fetchEnabled: true,
            filters: {
                balanceAccountId: 'balance-account-id',
                categories: [],
                statuses: [],
                currencies: [],
                createdSince: '2024-01-01T00:00:00.000Z',
                createdUntil: '2024-01-31T23:59:59.999Z',
            },
            onFiltersChanged,
        }))
    )!;

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(transactions.hasNext.value).toBe(true));

    transactions.goToNextPage();

    await vi.waitFor(() => expect(getTransactions).toHaveBeenCalledTimes(2));
    await nextTick();

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    scope.stop();
});

test('does not report filter changes when fetch availability changes', async () => {
    const fetchEnabled = ref(true);
    const onFiltersChanged = vi.fn();
    const scope = effectScope();

    scope.run(() =>
        useTransactionsList(() => ({
            fetchEnabled: fetchEnabled.value,
            filters: {
                balanceAccountId: 'balance-account-id',
                categories: [],
                statuses: [],
                currencies: [],
                createdSince: '2024-01-01T00:00:00.000Z',
                createdUntil: '2024-01-31T23:59:59.999Z',
            },
            onFiltersChanged,
        }))
    );

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));

    fetchEnabled.value = false;
    await nextTick();

    fetchEnabled.value = true;
    await nextTick();

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    scope.stop();
});
