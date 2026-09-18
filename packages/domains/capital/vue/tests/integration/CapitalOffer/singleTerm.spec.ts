import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--single-term';

test.describe('Single term', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render additional offer field', async ({ page }) => {
        await expect(page.getByText('Expected repayment period')).toBeVisible();
        await expect(page.getByText('6 months')).toBeVisible();
    });
});
