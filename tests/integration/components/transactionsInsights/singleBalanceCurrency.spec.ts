import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-insights--single-balance-currency';

test.describe('Single balance currency', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should not render currency selector in the filter bar', async ({ page }) => {
        const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });

        await Promise.all([
            expect(filters.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden(),
            expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible(),
            expect(filters.getByRole('button', { name: 'Currency', exact: true })).toBeHidden(), // hidden currency
        ]);
    });

    test('should render period totals', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Period result', { exact: true })).toBeVisible(),
            expect(page.getByText('Total incoming', { exact: true })).toBeVisible(),
            expect(page.getByText('Total outgoing', { exact: true })).toBeVisible(),
            expect(page.getByText('USD', { exact: true }).first()).toBeVisible(),
        ]);
    });
});
