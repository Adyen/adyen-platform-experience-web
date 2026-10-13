import { effectScope } from 'vue';
import { expect, test, vi } from 'vitest';
import { usePayoutsList } from './usePayoutsList';

const getPayouts = vi.fn();

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({
        endpoints: {
            getPayouts,
        },
    }),
}));

test('fetches the next page when paginating', async () => {
    getPayouts.mockReset();
    getPayouts.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const scope = effectScope();
    const payouts = scope.run(() =>
        usePayoutsList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
        }))
    )!;

    await vi.waitFor(() => expect(payouts.hasNext.value).toBe(true));

    payouts.goToNextPage();

    await vi.waitFor(() => expect(getPayouts).toHaveBeenCalledTimes(2));
    scope.stop();
});
