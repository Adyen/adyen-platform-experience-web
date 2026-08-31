import { effectScope, nextTick } from 'vue';
import { expect, test, vi } from 'vitest';
import { useDisputesList } from './useDisputesList';

const getDisputes = vi.fn();

vi.mock('../../integration/context', () => ({
    useDisputesContext: () => ({
        runtime: {
            getDisputes,
        },
    }),
}));

test('does not report filter changes when paginating', async () => {
    getDisputes.mockReset();
    getDisputes.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const onFiltersChanged = vi.fn();
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
            onFiltersChanged,
        }))
    )!;

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(disputes.hasNext.value).toBe(true));

    disputes.goToNextPage();

    await vi.waitFor(() => expect(getDisputes).toHaveBeenCalledTimes(2));
    await nextTick();

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    scope.stop();
});

test('reports filter changes when the request fails', async () => {
    getDisputes.mockReset();
    getDisputes.mockRejectedValue(new Error('Network error'));

    const onFiltersChanged = vi.fn();
    const scope = effectScope();

    scope.run(() =>
        useDisputesList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            statusGroup: 'CHARGEBACKS',
            reasonCategories: undefined,
            schemeCodes: undefined,
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
            onFiltersChanged,
        }))
    );

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    scope.stop();
});
