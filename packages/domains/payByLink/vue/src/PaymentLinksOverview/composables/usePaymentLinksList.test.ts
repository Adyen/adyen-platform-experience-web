import { effectScope, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import { usePaymentLinksList } from './usePaymentLinksList';

const getPaymentLinks = vi.fn();

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({
        endpoints: {
            getPaymentLinks,
        },
    }),
}));

test('resets pagination when external store IDs change with a store filter applied', async () => {
    getPaymentLinks.mockReset();
    getPaymentLinks.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const props = ref({
        fetchEnabled: true,
        statusGroup: 'active' as const,
        statuses: [],
        linkTypes: [],
        filterStoreIds: ['STORE_NY_001'],
        propStoreIds: ['STORE_NY_001'],
        _storeIds: 'STORE_NY_001',
        createdSince: '2024-01-01T00:00:00.000Z',
        createdUntil: '2024-01-31T23:59:59.999Z',
        lastRefreshTimestamp: 0,
    });
    const scope = effectScope();
    const paymentLinks = scope.run(() => usePaymentLinksList(() => props.value))!;

    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(paymentLinks.hasNext.value).toBe(true));

    paymentLinks.goToNextPage();
    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(2));

    props.value = {
        ...props.value,
        _storeIds: 'STORE_LON_001',
        propStoreIds: ['STORE_LON_001'],
    };

    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(3));

    expect(getPaymentLinks).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
            query: expect.objectContaining({
                storeIds: ['STORE_NY_001'],
            }),
        })
    );
    expect(getPaymentLinks.mock.calls[2]?.[1]?.query?.cursor).toBeUndefined();
    expect(paymentLinks.page.value).toBe(0);
    scope.stop();
});
