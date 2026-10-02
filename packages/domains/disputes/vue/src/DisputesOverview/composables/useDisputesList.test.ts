import { effectScope } from 'vue';
import { expect, test, vi } from 'vitest';
import { useDisputesList } from './useDisputesList';

const getDisputeList = vi.fn();

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({
        endpoints: {
            getDisputeList,
        },
    }),
}));

test('fetches the next page when paginating', async () => {
    getDisputeList.mockReset();
    getDisputeList.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const scope = effectScope();
    const disputes = scope.run(() =>
        useDisputesList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            statusGroup: 'CHARGEBACKS',
            reasonCategories: undefined,
            schemeCodes: undefined,
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
        }))
    )!;

    await vi.waitFor(() => expect(disputes.hasNext.value).toBe(true));

    disputes.goToNextPage();

    await vi.waitFor(() => expect(getDisputeList).toHaveBeenCalledTimes(2));
    scope.stop();
});
