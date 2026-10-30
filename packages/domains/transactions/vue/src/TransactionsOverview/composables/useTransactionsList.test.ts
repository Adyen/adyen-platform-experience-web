import { effectScope, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import { useTransactionsList } from './useTransactionsList';
import type { TransactionsFilters } from '../types';

const getTransactions = vi.fn();

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({
        endpoints: {
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

test('fetches the next page when paginating', async () => {
    getTransactions.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

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
        }))
    )!;

    await vi.waitFor(() => expect(transactions.hasNext.value).toBe(true));

    transactions.goToNextPage();

    await vi.waitFor(() => expect(getTransactions).toHaveBeenCalledTimes(2));
    scope.stop();
});

test('refreshes the list with the currently applied filters', async () => {
    getTransactions.mockReset();
    getTransactions.mockResolvedValue({
        data: [],
        _links: {},
    });

    const filters: TransactionsFilters = {
        balanceAccountId: 'balance-account-id',
        categories: ['Payment'],
        statuses: ['Booked'],
        currencies: ['EUR'],
        createdSince: '2024-01-01T00:00:00.000Z',
        createdUntil: '2024-01-31T23:59:59.999Z',
        paymentPspReference: 'PSP123',
    };
    const scope = effectScope();

    const transactions = scope.run(() =>
        useTransactionsList(() => ({
            fetchEnabled: true,
            filters,
        }))
    )!;

    await vi.waitFor(() => expect(transactions.hasFetchedOnce.value).toBe(true));

    transactions.refresh();

    await vi.waitFor(() => expect(getTransactions).toHaveBeenCalledTimes(2));
    for (const call of [1, 2]) {
        expect(getTransactions).toHaveBeenNthCalledWith(call, expect.anything(), {
            query: expect.objectContaining(filters),
        });
    }

    scope.stop();
});
