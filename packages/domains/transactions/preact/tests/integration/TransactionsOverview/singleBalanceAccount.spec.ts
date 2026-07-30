import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';
import { goToView } from '../../../../fixtures/integration/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--single-balance-account';

test.describe('Single balance account', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test('should not render balance account selector in transactions list filter bar', async ({ page }) => {
        const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
        await expect(filters.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
        await expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible();
        await expect(filters.getByRole('button', { name: 'Type', exact: true, disabled: false, expanded: false })).toBeVisible();
        await expect(filters.getByRole('button', { name: 'Currency', exact: true, disabled: false, expanded: false })).toBeVisible();
        await expect(filters.getByRole('button', { name: 'PSP reference', exact: true, disabled: false, expanded: false })).toBeVisible();
    });

    test('should not render balance account selector in transactions insights filter bar', async ({ page, analyticsEvents }) => {
        await goToView(page, analyticsEvents, 'Insights');

        const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
        await expect(filters.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
        await expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible();
        await expect(filters.getByRole('button', { name: 'Currency', exact: true, disabled: false, expanded: false })).toBeVisible();
    });
});
