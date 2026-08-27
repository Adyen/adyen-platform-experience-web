import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--eligible-us';

test.describe('Eligible US', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render US subtitle', async ({ page }) => {
        await expect(page.getByText('Loans are issued by Adyen N.V. San Francisco Branch and subject to credit approval.')).toBeVisible();
    });

    test('should render legal text in offer summary', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();

        // Verify creditor and address
        await expect(page.getByText('Creditor: Adyen N.V. – San Francisco Branch')).toBeVisible();
        await expect(page.getByText('505 Brannan Street, San Francisco, CA 94107.')).toBeVisible();

        // Assert the paragraph is present
        const legalParagraph = page.getByText('If your application for business credit is denied');
        await expect(legalParagraph).toBeVisible();

        // Locate the link inside the paragraph
        const emailLink = legalParagraph.getByRole('link', {
            name: 'capital-support@adyen.com',
        });

        // Assertions on the link
        await expect(emailLink).toBeVisible();
        await expect(emailLink).toHaveAttribute('href', 'mailto:capital-support@adyen.com');

        // Verify address
        await expect(legalParagraph).toContainText(
            'Office of the Comptroller of the Currency (OCC), Customer Assistance Group, PO Box 53570, Houston, TX 77052.'
        );
    });
});
