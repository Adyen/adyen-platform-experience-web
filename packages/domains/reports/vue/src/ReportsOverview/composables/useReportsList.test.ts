import { effectScope, nextTick, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import { useReportsList } from './useReportsList';

const getReports = vi.fn();

vi.mock('../../integration/context', () => ({
    useReportsContext: () => ({
        runtime: { getReports },
    }),
}));

test('does not report filter changes when paginating', async () => {
    getReports.mockReset();
    getReports.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const onFiltersChanged = vi.fn();
    const scope = effectScope();
    const reports = scope.run(() =>
        useReportsList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
            onFiltersChanged,
        }))
    )!;

    await vi.waitFor(() => expect(onFiltersChanged).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(reports.hasNext.value).toBe(true));

    reports.goToNextPage();

    await vi.waitFor(() => expect(getReports).toHaveBeenCalledTimes(2));
    await nextTick();

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    scope.stop();
});

test('reports filter changes when the request fails', async () => {
    getReports.mockReset();
    getReports.mockRejectedValue(new Error('Network error'));

    const onFiltersChanged = vi.fn();
    const scope = effectScope();

    scope.run(() =>
        useReportsList(() => ({
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

test('loads reports again after fetching is paused for a runtime refresh', async () => {
    getReports.mockReset();
    getReports.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({ data: [], _links: {} });
    const fetchEnabled = ref(true);
    const scope = effectScope();

    scope.run(() =>
        useReportsList(() => ({
            fetchEnabled: fetchEnabled.value,
            balanceAccountId: 'balance-account-id',
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
        }))
    );
    await vi.waitFor(() => expect(getReports).toHaveBeenCalledTimes(1));

    fetchEnabled.value = false;
    await nextTick();
    fetchEnabled.value = true;

    await vi.waitFor(() => expect(getReports).toHaveBeenCalledTimes(2));
    scope.stop();
});
