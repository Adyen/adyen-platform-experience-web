import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payouts-payout-details--error-details';

test.describe('Error - Details', () => {
    test('should render payout details error display', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const errorText = "We couldn't load the payout details. Try refreshing the page or come back later.";

        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText(errorText, { exact: true })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible(),
        ]);
    });
});
