import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--payment-pending';

test.describe('Payment pending', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render details screen', async ({ page }) => {
        await expect(page.getByText('Payment link details')).toBeVisible();
        await expect(page.getByText('Payment pending')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Expire now' })).toBeVisible();
    });
});
