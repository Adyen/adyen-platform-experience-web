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
        const toolbar = page.getByRole('toolbar');
        await expect(toolbar.getByRole('button', { name: /^Balance account/ })).toBeHidden();
        await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();
        await expect(toolbar.getByRole('button', { name: /^Type/, disabled: false })).toBeVisible();
        await expect(toolbar.getByRole('button', { name: /^Currency/, disabled: false })).toBeVisible();
        await expect(toolbar.getByRole('button', { name: /^PSP reference/, disabled: false })).toBeVisible();
    });

    test('should not render balance account selector in transactions insights filter bar', async ({ page, analyticsEvents }) => {
        await goToView(page, analyticsEvents, 'Insights');

        const toolbar = page.getByRole('toolbar');
        await expect(toolbar.getByRole('button', { name: /^Balance account/ })).toBeHidden();
        await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();
        await expect(toolbar.getByRole('button', { name: /^Currency/, disabled: false })).toBeVisible();
    });
});
