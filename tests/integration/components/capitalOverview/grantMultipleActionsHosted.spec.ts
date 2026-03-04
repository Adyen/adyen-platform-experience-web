import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grant-multiple-actions-hosted';

test.describe('Grant: Multiple actions - Hosted', () => {
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
        await expect(
            page.getByText('We need a bit more input from you to process your funds. Please complete these actions by February 15, 2025.')
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Submit information' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go to Terms & Conditions' })).toBeVisible();
    });

    test('should render a tooltip status tag is hovered', async ({ page }) => {
        await page.getByText('Action needed').hover();
        const tooltip = page.getByText('Sign the terms to receive your funds');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should go to terms of service page when "Go to Terms & Conditions" button in clicked', async ({ page, analyticsEvents }) => {
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

    test('should go to business financing page when "Submit information" button in clicked', async ({ page, analyticsEvents }) => {
        const analyticsEventProperties = {
            ...sharedGrantsOverviewAnalyticsEventProperties,
            subCategory: 'Missing action',
            label: 'Submit information for AnaCredit button',
        };

        const redirectionURL = 'https://www.adyen.com/capital';

        await page.getByText('Submit information').click();
        await page.waitForURL(redirectionURL, { waitUntil: 'domcontentloaded' });
        expect(page.url()).toBe(redirectionURL);

        await expectAnalyticsEvents(analyticsEvents, [['Clicked link', analyticsEventProperties]]);
    });
});
