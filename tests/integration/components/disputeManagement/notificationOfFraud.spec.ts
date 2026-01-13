import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--notification-of-fraud';

test.describe('Notification of fraud', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render a contact support alert when dispute is not defendable through the component', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Notification of fraud' })).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });
        await expect(icon).toBeVisible();

        await expect(
            page.getByText(
                'Contact support to resolve this notification of fraud. Refund this payment to avoid a future chargeback and paying extra fees.'
            )
        ).toBeVisible();
    });
});
