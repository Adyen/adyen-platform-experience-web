import { effectScope } from 'vue';
import { expect, test, vi } from 'vitest';
import { useReportsList } from './useReportsList';

const getReports = vi.fn();

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({
        endpoints: {
            getReports,
        },
    }),
}));

test('fetches the next page when paginating', async () => {
    getReports.mockReset();
    getReports.mockResolvedValue({
        data: [],
        _links: {
            next: { cursor: 'next-cursor' },
        },
    });

    const scope = effectScope();
    const reports = scope.run(() =>
        useReportsList(() => ({
            fetchEnabled: true,
            balanceAccountId: 'balance-account-id',
            createdSince: '2024-01-01T00:00:00.000Z',
            createdUntil: '2024-01-31T23:59:59.999Z',
        }))
    )!;

    await vi.waitFor(() => expect(reports.hasNext.value).toBe(true));

    reports.goToNextPage();

    await vi.waitFor(() => expect(getReports).toHaveBeenCalledTimes(2));
    scope.stop();
});
