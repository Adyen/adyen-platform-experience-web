import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';

const STORY_ID = 'mocked-transactions-transactions-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test('should render error message', async ({ page }) => {
        // [TODO]: Address displaying only incomplete primary error message, without title
        test.fixme(true, 'Only displaying incomplete primary error message, without title');

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your transactions. Contact support for help and share error code")).toBeVisible();
    });

    test('should render disabled "Export" button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Export', exact: true, disabled: true, expanded: false })).toBeVisible();
    });

    test('should render zero transaction totals', async ({ page }) => {
        let totalsCard = page.getByRole('button', { name: /^Total/i, expanded: false });

        await expect(totalsCard).toBeVisible();
        await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('0.00 USD', { exact: true })).toHaveCount(2);

        await totalsCard.click();

        // expanded totals card
        totalsCard = page.getByRole('button', { name: /^Total/i, expanded: true });

        await expect(totalsCard).toBeVisible();
        await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('0.00 USD', { exact: true })).toHaveCount(2);
        // [TODO]: Define proper accessibility hierarchy for expandable card
        await expect(page.getByRole('listitem').getByText('0.00 EUR', { exact: true })).toHaveCount(2);
    });
});

test.describe('onContactSupport argument', () => {
    test('should render error message with button to contact support', async ({ page, analyticsEvents }) => {
        // [TODO]: Address displaying only primary error message, without title and action button
        test.fixme(true, 'Only displaying primary error message, without title and action button');

        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your transactions. The error code is")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support', exact: true, disabled: false })).toBeVisible();
    });
});
