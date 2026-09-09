import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--single-term';

test.describe('Single term', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render additional offer field', async ({ page }) => {
        await expect(page.getByText('Financing terms')).toBeVisible();
        await expect(page.getByText('Fees')).toBeVisible();
        await expect(page.getByText('€1,430.00')).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toBeVisible();
        await expect(page.getByText('€14,430.00')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toBeVisible();
        await expect(page.getByText('11%', { exact: true })).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toBeVisible();
        await expect(page.getByText('6 months')).toBeVisible();
        await expect(page.getByText('Maximum repayment date')).toBeVisible();
        await expect(page.getByText('Sep 28, 2025')).toBeVisible();
    });
});
