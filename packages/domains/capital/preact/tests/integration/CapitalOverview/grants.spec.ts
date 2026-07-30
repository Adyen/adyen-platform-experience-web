import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, setTime } from '@integration-components/testing/playwright/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grants';

test.describe('Grants', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render grants screen with tabs', async ({ page }) => {
        await expect(page.getByText('Business financing')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByRole('radio', { name: 'In progress' })).toBeVisible();
        await expect(page.getByRole('radio', { name: 'Closed' })).toBeVisible();
    });

    test('should render in-progress grants when "In progress" tab is clicked', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByRole('radio', { name: 'In progress' }).click();

        const amountLabel = page.getByTestId('grant-amount-label').first();
        await expect(amountLabel).toBeVisible();
        await expect(amountLabel).toHaveText('Remaining');

        await expect(page.getByText('€8,220.00').first()).toBeVisible();
        await expect(page.getByText('Term ends: May 16, 2025').first()).toBeVisible();

        const progressBar = page.getByRole('progressbar').first();
        await expect(progressBar).toBeVisible();
        await expect(progressBar).toHaveAttribute('aria-valuenow', '1200000');
        await expect(progressBar).toHaveAttribute('aria-valuemax', '2022000');

        await expect(page.getByRole('button', { name: 'Send repayment', exact: true }).first()).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeVisible();
    });

    test('should show grant details when button for expanding is clicked', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await Promise.all([
            expect(page.getByText('Your requested funds were: €20,000.00')).toBeVisible(),
            expect(page.getByText('Remaining amount')).toBeVisible(),
            expect(page.getByText('€8,130.00')).toBeVisible(),
            expect(page.getByText('Remaining fees')).toBeVisible(),
            expect(page.getByText('€90.00')).toBeVisible(),
            expect(page.getByText('Repaid amount')).toBeVisible(),
            expect(page.getByText('€11,870.00')).toBeVisible(),
            expect(page.getByText('Repaid fees')).toBeVisible(),
            expect(page.getByText('€130.00')).toBeVisible(),
            expect(page.getByText('Daily repayment rate')).toBeVisible(),
            expect(page.getByText('11%')).toBeVisible(),
            expect(page.getByText('Maximum repayment period')).toBeVisible(),
            expect(page.getByText('9 months')).toBeVisible(),
            expect(page.getByText('Expected repayment period')).toBeVisible(),
            expect(page.getByText('180 days (135 days left)')).toBeVisible(),
            expect(page.getByText('Total repayment amount')).toBeVisible(),
            expect(page.getByText('€20,220.00')).toBeVisible(),
            expect(page.getByText('30-day repayment minimum')).toBeVisible(),
            expect(page.getByText('€800.00')).toBeVisible(),
            expect(page.getByText('Grant ID').first()).toBeVisible(),
            expect(page.getByText('afedbe0e05e9')).toBeVisible(),
            expect(page.getByText('Account description')).toBeVisible(),
            expect(page.getByText('Primary balance account')).toBeVisible(),
            expect(page.getByText('Account ID')).toBeVisible(),
            expect(page.getByText('BA1234567')).toBeVisible(),
            expect(page.getByTestId('collapse-button')).toBeVisible(),
        ]);
    });

    test('should hide grant details when button for collapsing is clicked', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await page.getByTestId('collapse-button').click();
        await expect(page.getByText('Your requested funds were: €20,000.00')).toBeHidden();
    });

    test('should show a tooltip when "30-day repayment minimum" label is hovered', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await page.getByText('30-day repayment minimum').hover();
        const tooltip = page.getByText('Minimum repayment every 30 days to repay the financing on time');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should render closed grants when "Closed" tab is clicked', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await expect(page.getByText('Requested funds', { exact: true })).toHaveCount(4);
        await expect(page.getByText('€20,000.00')).toHaveCount(5);
        await expect(page.getByText('Grant ID')).toHaveCount(5);
        await expect(page.getByTestId('grant-id-copy-text')).toHaveCount(4);
        await expect(page.getByText('Fully repaid')).toBeVisible();
        await expect(page.getByText('Revoked')).toBeVisible();
        await expect(page.getByText('Written off')).toBeVisible();
        await expect(page.getByText('Failed', { exact: true })).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render a tooltip with the grant ID when "Grant ID" label is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Grant ID').last().hover();
        const tooltip = page.getByText('6d9d171783ba');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should render a tooltip when failed status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByRole('button', { name: 'Failed' }).hover();
        const tooltip = page.getByText("We couldn't process this request. Try again with a new offer.");
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should render a tooltip when revoked status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Revoked').hover();
        const tooltip = page.getByText('You accepted but then returned these funds');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should render a tooltip when written-off status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Written off').hover();
        const tooltip = page.getByText('You accepted these funds but did not repay them');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
