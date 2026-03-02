import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-insights--single-balance-account';

test.describe('Single balance account', () => {
    test('should not render balance account selector in the filter bar', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);

        const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });

        await Promise.all([
            expect(filters.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden(),
            expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible(),
            expect(filters.getByRole('button', { name: 'Currency', exact: true, disabled: false, expanded: false })).toBeVisible(),
        ]);
    });
});
