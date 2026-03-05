import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';
import { downloadTransactions, openExportPopover } from './shared/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--error-export';

test.describe('Error - Export', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
        await openExportPopover(page, analyticsEvents);
        await downloadTransactions(page, analyticsEvents, 'Default', true);
    });

    test('should render export error alert', async ({ page }) => {
        const alert = page.locator('.adyen-pe-alert--critical');

        await expect(alert).toBeVisible();
        await expect(alert.getByText('Download has failed. Please try again.', { exact: true })).toBeVisible();
        await expect(alert.getByRole('button', { name: 'Dismiss', exact: true })).toBeVisible();

        await expect(alert).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);
    });

    test('should dismiss the export error alert when the "x" button is clicked', async ({ page }) => {
        const alert = page.locator('.adyen-pe-alert--critical');
        const dismissButton = alert.getByRole('button', { name: 'Dismiss', exact: true });
        await dismissButton.click();
        await expect(alert).toBeHidden();
    });

    test('should dismiss the export error alert when the export popover is reopened', async ({ page, analyticsEvents }) => {
        await openExportPopover(page, analyticsEvents);
        await expect(page.locator('.adyen-pe-alert--critical')).toBeHidden();
    });
});
