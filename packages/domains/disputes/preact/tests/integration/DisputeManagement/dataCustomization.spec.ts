import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';

const STORY_ID = 'mocked-disputes-dispute-management--data-customization';

test.describe('Data Customization', () => {
    test('should hide the configured standard fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Sydney', { exact: true })).toBeVisible();

        await expect(page.getByText('Dispute reference', { exact: true })).toBeHidden();
        await expect(page.getByText('Opened on', { exact: true })).toBeHidden();
        await expect(page.getByText('Respond by', { exact: true })).toBeHidden();
        await expect(page.getByText('Account', { exact: true })).toBeHidden();
    });

    test('should render dispute details with custom data fields and action buttons', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const countryIcon = page.getByAltText('', { exact: true });
        const summaryLink = page.getByRole('link', { name: 'Go to Summary', exact: true, disabled: false });
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

        const messages: string[] = [];
        page.once('console', message => messages.push(message.text()));

        await actionButton.click();
        expect(messages).toContain('Action');
    });
});
