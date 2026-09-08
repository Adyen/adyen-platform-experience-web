import { effectScope, nextTick, ref } from 'vue';
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

test('uses the updated external store IDs and resets pagination when the selected store is no longer available', async () => {
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
        propStoreIds: ['STORE_NY_001', 'STORE_LON_001'],
        createdSince: '2024-01-01T00:00:00.000Z',
        createdUntil: '2024-01-31T23:59:59.999Z',
        lastRefreshTimestamp: 0,
    });
    const scope = effectScope();
    const paymentLinks = scope.run(() => usePaymentLinksList(() => props.value))!;

    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(paymentLinks.hasNext.value).toBe(true));
    expect(getPaymentLinks.mock.calls[0]?.[1]?.query?.storeIds).toEqual(['STORE_NY_001']);

    paymentLinks.goToNextPage();
    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(2));

    props.value = {
        ...props.value,
        propStoreIds: ['STORE_LON_001'],
    };

    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(3));

    expect(getPaymentLinks).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
            query: expect.objectContaining({
                storeIds: ['STORE_LON_001'],
            }),
        })
    );
    expect(getPaymentLinks.mock.calls[2]?.[1]?.query?.cursor).toBeUndefined();
    expect(paymentLinks.page.value).toBe(0);
    scope.stop();
});

test('does not report filter changes when paginating', async () => {
    getPaymentLinks.mockReset();
    getPaymentLinks.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const onFiltersChanged = vi.fn();
    const scope = effectScope();
    const paymentLinks = scope.run(() =>
        usePaymentLinksList(() => ({
            fetchEnabled: true,
            statusGroup: 'active',
            statuses: [],
            linkTypes: [],
            filterStoreIds: [],
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
            lastRefreshTimestamp: 0,
            onFiltersChanged,
        }))
    )!;

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(paymentLinks.hasNext.value).toBe(true));

    paymentLinks.goToNextPage();

    await vi.waitFor(() => expect(getPaymentLinks).toHaveBeenCalledTimes(2));
    await nextTick();

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    scope.stop();
});

test('reports filter changes even when the request fails', async () => {
    getPaymentLinks.mockReset();
    getPaymentLinks.mockRejectedValue(new Error('Network error'));

    const onFiltersChanged = vi.fn();
    const scope = effectScope();

    scope.run(() =>
        usePaymentLinksList(() => ({
            fetchEnabled: true,
            statusGroup: 'active',
            statuses: [],
            linkTypes: [],
            filterStoreIds: [],
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
            lastRefreshTimestamp: 0,
            onFiltersChanged,
        }))
    );

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    scope.stop();
});
