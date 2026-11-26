import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--single-term-cash-advance';

test.describe('Single term - Cash advance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show the single fulfillment period as an estimate in advance terms', async ({ page }) => {
        const selection = page.getByTestId('capital-offer-selection');

        await Promise.all([
            expect(selection.getByText('Estimated fulfillment period*', { exact: true })).toBeVisible(),
            expect(selection.getByText('6 months', { exact: true })).toBeVisible(),
            expect(selection.getByText('Expected repayment period', { exact: true })).toBeHidden(),
        ]);
    });
});
