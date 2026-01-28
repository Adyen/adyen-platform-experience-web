import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--redacted';

test.describe('Redacted', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should redact shopper information', async ({ page }) => {
        await page.getByRole('tab', { name: 'Shopper information' }).click();
        await expect(page.getByText('CUST-001')).toBeVisible();
        await expect(page.getByText('United States')).toBeVisible();
        await expect(page.getByText('********')).toHaveCount(4);
    });
});
