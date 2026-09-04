import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--multiple-hosted-actions';

test.describe('Multiple hosted actions', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant with actions', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Requested funds')).toBeVisible(),
            expect(page.getByText('€20,000.00')).toBeVisible(),
            expect(page.getByText('Action needed')).toBeVisible(),
            expect(page.getByText('Grant ID')).toBeVisible(),
            expect(page.getByTestId('grant-id-copy-text')).toBeVisible(),
            expect(
                page.getByText(
                    "You're almost ready. To process your funds, we just need your input. Please complete these actions by February 15, 2025."
                )
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Submit information' })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Sign terms & conditions' })).toBeVisible(),
        ]);
    });

    test('should go to terms of service page when signing button is clicked', async ({ page, analyticsEvents }) => {
        const analyticsEventProperties = {
            ...sharedGrantsOverviewAnalyticsEventProperties,
            subCategory: 'Missing action',
            label: 'Go to terms & conditions button clicked',
        };
        const redirectionURL = 'https://www.adyen.com/';

        await page.getByRole('button', { name: 'Sign terms & conditions', exact: true }).click();
        await page.waitForURL(redirectionURL, { waitUntil: 'domcontentloaded' });
        expect(page.url()).toBe(redirectionURL);

        await expectAnalyticsEvents(analyticsEvents, [['Clicked link', analyticsEventProperties]]);
    });

    test('should go to business financing page when information submit button is clicked', async ({ page, analyticsEvents }) => {
        const analyticsEventProperties = {
            ...sharedGrantsOverviewAnalyticsEventProperties,
            subCategory: 'Missing action',
            label: 'Submit information for AnaCredit button',
        };
        const redirectionURL = 'https://www.adyen.com/capital';

        await page.getByRole('button', { name: 'Submit information', exact: true }).click();
        await page.waitForURL(redirectionURL, { waitUntil: 'domcontentloaded' });
        expect(page.url()).toBe(redirectionURL);

        await expectAnalyticsEvents(analyticsEvents, [['Clicked link', analyticsEventProperties]]);
    });
});
