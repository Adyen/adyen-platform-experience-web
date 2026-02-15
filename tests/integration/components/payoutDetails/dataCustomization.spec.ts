import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { CUSTOM_URL_EXAMPLE } from '../../../../stories/utils/constants';

const STORY_ID = 'mocked-payouts-payout-details--data-customization';

test.describe('Data Customization', () => {
    test('should render payout details with custom data fields and action buttons', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const countryIcon = page.getByAltText('', { exact: true });
        const summaryLink = page.getByRole('link', { name: 'See summary', exact: true, disabled: false });
        const actionButton = page.getByRole('button', { name: 'Send email', exact: true, disabled: false });

        await Promise.all([
            // Custom data fields
            expect(page.getByText('Store', { exact: true })).toBeVisible(),
            expect(page.getByText('Sydney', { exact: true })).toBeVisible(),

            expect(page.getByText('Product', { exact: true })).toBeVisible(),
            expect(page.getByText('Coffee', { exact: true })).toBeVisible(),

            expect(page.getByText('Summary', { exact: true })).toBeVisible(),
            expect(summaryLink).toBeVisible(),

            expect(page.getByText('Country', { exact: true })).toBeVisible(),
            expect(countryIcon).toBeAttached(),

            // Custom action buttons
            expect(actionButton).toBeVisible(),
        ]);

        const [newPage] = await Promise.all([page.context().waitForEvent('page'), summaryLink.click()]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        const messages: string[] = [];
        page.once('console', message => messages.push(message.text()));

        await actionButton.click();
        expect(messages).toContain('Action');
    });
});
