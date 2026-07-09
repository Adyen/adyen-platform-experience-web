import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';
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
        // [TODO]: Address missing alert dismiss button
        test.fixme(true, 'Missing alert dismiss button');

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible();
        await expect(alert).toHaveCount(1);
        await expect(alert.getByText('Download has failed. Please try again.', { exact: true })).toBeVisible();
        await expect(alert.getByRole('button', { name: 'Dismiss', exact: true, disabled: false })).toBeVisible();
    });

    test('should dismiss the export error alert when the "x" button is clicked', async ({ page }) => {
        // [TODO]: Address missing alert dismiss button
        test.fixme(true, 'Missing alert dismiss button');

        const alert = page.getByRole('alert');
        const dismissButton = alert.getByRole('button', { name: 'Dismiss', exact: true, disabled: false });
        await dismissButton.click();
        await expect(alert).toBeHidden();
    });

    test('should dismiss the export error alert when the export popover is reopened', async ({ page, analyticsEvents }) => {
        await openExportPopover(page, analyticsEvents);
        await expect(page.getByRole('alert')).toBeHidden();
    });
});
