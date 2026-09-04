import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--eligible-us';

test.describe('Eligible US', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render US subtitle', async ({ page }) => {
        await expect(page.getByText('Loans are issued by Adyen N.V. San Francisco Branch and subject to credit approval.')).toBeVisible();
    });

    test('should render the US legal notice in the offer summary', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();

        const legalNotice = page.getByText('If your application for business credit is denied');

        await Promise.all([
            expect(page.getByText('Creditor: Adyen N.V. – San Francisco Branch 505 Brannan Street, San Francisco, CA 94107.')).toBeVisible(),
            expect(legalNotice).toBeVisible(),
            expect(legalNotice.getByRole('link', { name: 'capital-support@adyen.com' })).toHaveAttribute('href', 'mailto:capital-support@adyen.com'),
            expect(legalNotice).toContainText(
                'Office of the Comptroller of the Currency (OCC), Customer Assistance Group, PO Box 53570, Houston, TX 77052.'
            ),
        ]);
    });
});
