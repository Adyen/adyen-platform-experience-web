import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Status groups', () => {
    test('should switch to the fraud alerts status group', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const grid = page.getByRole('grid');

        await expect(grid.getByRole('columnheader', { name: 'Respond by', exact: true })).toBeVisible();

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();

        await expect(grid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Total payment amount', exact: true })).toBeVisible();
    });

    test('should switch to the ongoing and closed status group', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const grid = page.getByRole('grid');

        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();

        await expect(grid.getByRole('columnheader', { name: 'Status', exact: true })).toBeVisible();
    });

    test('should only fetch the final status group after rapidly tabbing', async ({ page }) => {
        const initialDisputesRequest = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/disputes'));
        await goToStory(page, { id: STORY_ID });
        await initialDisputesRequest;

        const statusGroupRequests: string[] = [];

        page.on('request', request => {
            const url = new URL(request.url());
            if (request.method() === 'GET' && url.pathname.endsWith('/disputes')) {
                const statusGroup = url.searchParams.get('statusGroup');
                if (statusGroup) statusGroupRequests.push(statusGroup);
            }
        });

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();
        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();
        await expect.poll(() => statusGroupRequests.filter(statusGroup => statusGroup !== 'CHARGEBACKS')).toEqual(['ONGOING_AND_CLOSED']);
    });
});
