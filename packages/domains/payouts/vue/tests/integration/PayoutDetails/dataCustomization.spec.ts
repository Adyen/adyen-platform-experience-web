import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';

const STORY_ID = 'mocked-payouts-payout-details--data-customization';

test.describe('Data Customization', () => {
    test('should render payout details with custom data fields and action buttons', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const countryIcon = page.getByAltText('', { exact: true });
        const summaryLink = page.getByRole('link', { name: 'See summary', exact: true, disabled: false });
        const actionButton = page.getByRole('button', { name: 'Send email', exact: true, disabled: false });

        // Custom data fields
        await expect(page.getByText('Store', { exact: true })).toBeVisible();
        await expect(page.getByText('Sydney', { exact: true })).toBeVisible();

        await expect(page.getByText('Product', { exact: true })).toBeVisible();
        await expect(page.getByText('Coffee', { exact: true })).toBeVisible();

        await expect(page.getByText('Summary', { exact: true })).toBeVisible();
        await expect(summaryLink).toBeVisible();

        await expect(page.getByText('Country', { exact: true })).toBeVisible();
        await expect(countryIcon).toBeAttached();

        // Custom action buttons
        await expect(actionButton).toBeVisible();

        const [newPage] = await Promise.all([page.context().waitForEvent('page'), summaryLink.click()]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        const actionPromise = page.waitForEvent('console', {
            predicate: message => message.text() === 'Action',
        });

        await actionButton.click();
        await actionPromise;
    });
});
