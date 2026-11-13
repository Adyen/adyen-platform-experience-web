import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--hidden-tabs';

test.describe('Disputes Overview - Hidden tabs', () => {
    test('should hide tabs and fetch the first visible status group', async ({ page }) => {
        const statusGroupRequests: string[] = [];

        page.on('request', request => {
            const url = new URL(request.url());
            const statusGroup = url.searchParams.get('statusGroup');
            if (request.method() === 'GET' && url.pathname.endsWith('/disputes') && statusGroup) statusGroupRequests.push(statusGroup);
        });

        await goToStory(page, { id: STORY_ID });

        await expect(page.getByRole('tab', { name: 'Chargebacks' })).toHaveCount(0);
        await expect(page.getByRole('tab', { name: 'Fraud alerts' })).toHaveAttribute('aria-selected', 'true');
        await expect.poll(() => [...new Set(statusGroupRequests)]).toEqual(['FRAUD_ALERTS']);
    });
});
