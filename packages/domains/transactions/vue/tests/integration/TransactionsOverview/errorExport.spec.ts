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

    test('should show a dismissible export error toast', async ({ page }) => {
        const toast = page.getByTestId('toast');
        await expect(toast).toBeVisible();
        await expect(toast).toHaveCount(1);
        await expect(toast.getByTestId('toast-item').getByText('Download has failed. Please try again.', { exact: true })).toBeVisible();
        await expect(toast.getByRole('button', { name: 'Dismiss', exact: true, disabled: false })).toBeVisible();
    });

    test('should dismiss the export error toast when the dismiss button is clicked', async ({ page }) => {
        const toast = page.getByTestId('toast');
        const dismissButton = toast.getByRole('button', { name: 'Dismiss', exact: true, disabled: false });
        await dismissButton.click();
        await expect(toast).toBeHidden();
    });

    test('should dismiss the export error toast when the export popover is reopened', async ({ page, analyticsEvents }) => {
        await openExportPopover(page, analyticsEvents);
        await expect(page.getByTestId('toast')).toBeHidden();
    });
});
