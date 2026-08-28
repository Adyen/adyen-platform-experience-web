import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--early-renewal';

test.describe('Early renewal', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render the new financing, current balance, and amount to receive', async ({ page }) => {
        const newLoanField = page.getByText('New loan').locator('..');
        const currentLoanBalanceField = page.getByText('Current loan balance').locator('..');
        const amountToReceiveField = page.getByText("Amount you'll receive").locator('..');

        await Promise.all([
            expect(newLoanField).toBeVisible(),
            expect(newLoanField.getByText('€18,600')).toBeVisible(),
            expect(currentLoanBalanceField).toBeVisible(),
            expect(currentLoanBalanceField.getByText('€8,130')).toBeVisible(),
            expect(amountToReceiveField).toBeVisible(),
            expect(amountToReceiveField.getByText('€10,470')).toBeVisible(),
        ]);
    });
});
