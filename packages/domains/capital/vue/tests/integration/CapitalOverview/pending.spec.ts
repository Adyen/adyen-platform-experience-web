import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--pending';

test.describe('Pending', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Requested funds')).toBeVisible(),
            expect(page.getByText('€20,000.00')).toBeVisible(),
            expect(page.getByText('Pending')).toBeVisible(),
            expect(page.getByText('Grant ID')).toBeVisible(),
            expect(page.getByTestId('grant-id-copy-text')).toBeVisible(),
            expect(page.getByText('We received your request and we’re working on it now. Check back soon for the next steps.')).toBeVisible(),
            expect(page.getByRole('progressbar', { name: 'Grant repayment' })).toHaveCount(0),
            expect(page.getByRole('button', { name: 'Show grant details' })).toHaveCount(0),
        ]);
    });

    test('should render a tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Pending').hover();

        await expect(page.getByRole('tooltip', { name: 'You should get the funds within one business day' })).toBeVisible();
    });

    test('should render a tooltip with the grant ID when "Grant ID" label is hovered', async ({ page }) => {
        await page.getByText('Grant ID').hover();

        await expect(page.getByRole('tooltip', { name: '7e18b082372f' })).toBeVisible();
    });
});
