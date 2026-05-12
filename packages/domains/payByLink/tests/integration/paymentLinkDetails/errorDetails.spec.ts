import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--error-details';

test.describe('Error - Details', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render details error', async ({ page }) => {
        await expect(page.getByText('Payment link details', { exact: true })).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText("We couldn't load the payment link details.")).toBeVisible();
        await expect(page.getByText('Try refreshing the page or come back later.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    });
});
