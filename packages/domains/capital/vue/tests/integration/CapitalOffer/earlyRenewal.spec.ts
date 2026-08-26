import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--early-renewal';

test.describe('Early renewal', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render the new financing, current balance, and amount to receive', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('New loan')).toBeVisible(),
            expect(page.getByText('€18,600')).toBeVisible(),
            expect(page.getByText('Current loan balance')).toBeVisible(),
            expect(page.getByText('€8,130')).toBeVisible(),
            expect(page.getByText("Amount you'll receive")).toBeVisible(),
            expect(page.getByText('€10,470')).toBeVisible(),
        ]);
    });
});
