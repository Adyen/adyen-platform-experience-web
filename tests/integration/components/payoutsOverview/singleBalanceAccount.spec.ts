import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--single-balance-account';

test.describe('Single balance account', () => {
    test('should not render balance account selector in the filter bar', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const filters = page.getByRole('group', { name: 'Payouts filters', exact: true });

        await Promise.all([
            expect(filters.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden(),
            expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible(),
        ]);
    });
});
