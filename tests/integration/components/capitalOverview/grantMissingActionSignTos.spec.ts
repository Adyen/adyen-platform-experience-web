import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grant-missing-action-sign-tos';

test.describe('Grant: Missing Action Sign TOS', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant with actions', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Action needed')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByText('Sign the Terms & Conditions to receive your funds. This offer expires on February 15, 2025.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go to Terms & Conditions' })).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render a tooltip status tag is hovered', async ({ page }) => {
        await page.getByText('Action needed').hover();
        const tooltip = page.getByText('Sign the terms to receive your funds');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should go to terms and conditions page when "Go to Terms & Conditions" button in clicked', async ({ page, analyticsEvents }) => {
        const analyticsEventProperties = {
            ...sharedGrantsOverviewAnalyticsEventProperties,
            subCategory: 'Missing action',
            label: 'Go to terms & conditions button clicked',
        };

        const redirectionURL = 'https://www.adyen.com/';

        await page.getByRole('button', { name: 'Go to Terms & Conditions', exact: true }).click();
        await page.waitForURL(redirectionURL, { waitUntil: 'domcontentloaded' });
        expect(page.url()).toBe(redirectionURL);

        await expectAnalyticsEvents(analyticsEvents, [['Clicked link', analyticsEventProperties]]);
    });
});
