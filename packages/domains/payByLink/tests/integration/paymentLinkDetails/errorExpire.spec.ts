import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--error-expire';

test.describe('Error - Expire', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render expiration error', async ({ page }) => {
        await page.getByRole('button', { name: 'Expire now' }).click();
        await page.getByRole('button', { name: 'Expire link' }).click();
        await expect(page.getByText('Expire this link')).toBeVisible();
        await expect(
            page.getByText(
                "Deactivating this link will immediately prevent your shopper from making new payments. You'll need to create a new payment link or reissue the deactivated one for the shopper to pay."
            )
        ).toBeVisible();
        await expect(page.getByText('Something went wrong')).toBeVisible();
        await expect(page.getByText('We could not deactivate the payment link. Please, try again.')).toBeVisible();
    });
});
