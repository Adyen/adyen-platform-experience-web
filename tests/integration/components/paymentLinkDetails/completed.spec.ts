import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--completed';

test.describe('Completed', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render details screen', async ({ page }) => {
        await expect(page.getByText('Payment link details')).toBeVisible();
        await expect(page.getByText('Completed', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Expire now' })).toBeHidden();
    });

    test('should render the activity tab', async ({ page }) => {
        await page.getByRole('tab', { name: 'Activity' }).click();
        await expect(page.getByText('Payment link created')).toBeVisible();
        await expect(page.getByText('Payment initiated')).toBeVisible();
    });
});
