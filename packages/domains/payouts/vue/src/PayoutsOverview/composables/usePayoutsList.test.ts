import { effectScope, nextTick } from 'vue';
import { expect, test, vi } from 'vitest';
import { usePayoutsList } from './usePayoutsList';

const getPayouts = vi.fn();

vi.mock('../../integration/context', () => ({
    usePayoutsContext: () => ({
        runtime: {
            getPayouts,
        },
    }),
}));

test('does not report filter changes when paginating', async () => {
    getPayouts.mockReset();
    getPayouts.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const onFiltersChanged = vi.fn();
    const scope = effectScope();
    const payouts = scope.run(() =>
        usePayoutsList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
            onFiltersChanged,
        }))
    )!;

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(payouts.hasNext.value).toBe(true));

    payouts.goToNextPage();

    await vi.waitFor(() => expect(getPayouts).toHaveBeenCalledTimes(2));
    await nextTick();

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    scope.stop();
});

test('reports filter changes when the request fails', async () => {
    getPayouts.mockReset();
    getPayouts.mockRejectedValue(new Error('Network error'));

    const onFiltersChanged = vi.fn();
    const scope = effectScope();

    scope.run(() =>
        usePayoutsList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
            onFiltersChanged,
        }))
    );

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    scope.stop();
});
