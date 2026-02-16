import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';
import { goToView } from './shared/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--single-balance-account';

test.describe('Single balance account', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test('should not render balance account selector in transactions list filter bar', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Date range', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Type', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'PSP reference', exact: true })).toBeVisible();
    });

    test('should not render balance account selector in transactions insights filter bar', async ({ page, analyticsEvents }) => {
        await goToView(page, analyticsEvents, 'Insights');
        await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Date range', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeVisible();
    });
});
