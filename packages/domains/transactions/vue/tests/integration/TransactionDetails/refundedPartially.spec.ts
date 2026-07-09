import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionDetails';

const STORY_ID = 'mocked-transactions-transaction-details--refunded-partially';

test.describe('Refunded - Partially', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render partially refunded payment transaction', async ({ page }) => {
        await expect(page.getByText('Payment', { exact: true })).toBeVisible();
        await expect(page.getByText('Partially refunded', { exact: true })).toBeVisible();

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByRole('status')).toHaveCount(1);
        await expect(page.getByRole('alert')).toHaveCount(0);

        await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: false })).toBeVisible();
    });
});
