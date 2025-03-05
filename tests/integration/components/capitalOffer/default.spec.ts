import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-offer--default';

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render offer selection screen', async ({ page }) => {
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('How much money do you need?')).toBeVisible();
        await expect(page.getByText('€12,500')).toBeVisible();
        await expect(page.getByRole('slider')).toBeVisible();
        await expect(page.getByText('min', { exact: true })).toBeVisible();
        await expect(page.getByText('€1,000')).toBeVisible();
        await expect(page.getByText('max')).toBeVisible();
        await expect(page.getByText('€25,000')).toBeVisible();
        await expect(
            page.getByText('You will need to repay a minimum of €1,156.25 every 30 days to fully pay off the funds by December 31, 2025')
        ).toBeVisible();
        await expect(page.getByText('Fees')).toBeVisible();
        await expect(page.getByText('€1,375.00')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toBeVisible();
        await expect(page.getByText('11%')).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toBeVisible();
        await expect(page.getByText('365 days')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Review offer' })).toBeVisible();
    });

    test('should update offer details when slider value is changed', async ({ page }) => {
        const slider = page.getByRole('slider');
        await slider.dragTo(slider, { targetPosition: { x: 0, y: 0 } });
        await expect(page.getByRole('status')).toHaveText('€1,000');
        await expect(page.getByText('€92.50')).toBeVisible();
        await expect(page.getByText('€110.00')).toBeVisible();
    });

    test('should go to offer summary screen when "Review offer" button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Review offer' }).click();
        await expect(page.getByText('Business financing summary')).toBeVisible();
    });

    test('should render offer summary screen', async ({ page }) => {
        await page.getByRole('button', { name: 'Review offer' }).click();
        await expect(page.getByText('Business financing summary')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('You’re requesting funding of €12,500.')).toBeVisible();
        await expect(
            page.getByText('You will need to repay a minimum of €1,156.25 every 30 days to fully pay off the funds by December 31, 2025.')
        ).toBeVisible();
        await expect(page.getByText('Fees')).toBeVisible();
        await expect(page.getByText('€1,375.00')).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toBeVisible();
        await expect(page.getByText('€13,875.00')).toBeVisible();
        await expect(page.getByText('Repayment threshold')).toBeVisible();
        await expect(page.getByText('€1,156.25', { exact: true })).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toBeVisible();
        await expect(page.getByText('11%')).toBeVisible();
        await expect(page.getByText('Maximum repayment period')).toBeVisible();
        await expect(page.getByText('18 months')).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toBeVisible();
        await expect(page.getByText('365 days')).toBeVisible();
        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('Primary account')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Request funds' })).toBeVisible();
    });

    test('should show a tooltip when "Repayment threshold" label is hovered', async ({ page }) => {
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByText('Repayment threshold').hover();
        await expect(page.getByText('Minimum repayment every 30 days to repay the financing on time')).toBeVisible();
    });

    test('should go back to offer selection screen when "Back" button in offer summary screen is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByText('Business financing offer')).toBeVisible();
    });
});

test.describe('onOfferDismiss argument', () => {
    test('should render "Back" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferDismiss: 'Enabled' } });
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    });
});

test.describe('onOfferSelect argument', () => {
    test('should not go to offer summary screen when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferSelect: 'Enabled' } });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await expect(page.getByText('Business financing summary')).toBeHidden();
    });
});
