import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-overview--grant-active';

test.describe('Grant: Active', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render active grant', async ({ page }) => {
        const amountLabel = page.getByTestId('grant-amount-label').first();
        await expect(amountLabel).toBeVisible();
        await expect(amountLabel).toHaveText('Remaining');
        await expect(page.getByText('€8,220.00').first()).toBeVisible();
        await expect(page.getByText('Term ends: May 16, 2025').first()).toBeVisible();
        const progressBar = page.getByRole('progressbar').first();
        await expect(progressBar).toBeVisible();
        await expect(progressBar).toHaveAttribute('aria-valuenow', '1200000');
        await expect(progressBar).toHaveAttribute('aria-valuemax', '2022000');
        await expect(page.getByTestId('expand-button')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeHidden();
    });

    test('should show grant details when button for expanding is clicked', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await expect(page.getByText('Your requested funds were: €20,000.00')).toBeVisible();
        await expect(page.getByText('Remaining amount')).toBeVisible();
        await expect(page.getByText('€8,130.00')).toBeVisible();
        await expect(page.getByText('Remaining fees')).toBeVisible();
        await expect(page.getByText('€90.00')).toBeVisible();
        await expect(page.getByText('Repaid amount')).toBeVisible();
        await expect(page.getByText('€11,870.00')).toBeVisible();
        await expect(page.getByText('Repaid fees')).toBeVisible();
        await expect(page.getByText('€130.00')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toBeVisible();
        await expect(page.getByText('11%')).toBeVisible();
        await expect(page.getByText('Maximum repayment period')).toBeVisible();
        await expect(page.getByText('18 months')).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toBeVisible();
        await expect(page.getByText('365 days (135 days left)')).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toBeVisible();
        await expect(page.getByText('€20,220.00')).toBeVisible();
        await expect(page.getByText('Repayment threshold')).toBeVisible();
        await expect(page.getByText('€800.00')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByText('afedbe0e05e9')).toBeVisible();
        await expect(page.getByText('Account description')).toBeVisible();
        await expect(page.getByText('Primary balance account')).toBeVisible();
        await expect(page.getByText('Account ID')).toBeVisible();
        await expect(page.getByText('BA1234567')).toBeVisible();
        await expect(page.getByTestId('collapse-button')).toBeVisible();
    });

    test('should hide grant details when button for collapsing is clicked', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await page.getByTestId('collapse-button').click();
        await expect(page.getByText('Your requested funds were: €20,000.00')).toBeHidden();
    });

    test('should show a tooltip when "Repayment threshold" label is hovered', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await page.getByText('Repayment threshold').hover();
        await expect(page.getByText('Minimum repayment every 30 days to repay the financing on time')).toBeVisible();
    });
});
