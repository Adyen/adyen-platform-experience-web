import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grant-multiple-actions-embedded';

test.describe('Grant: Multiple actions - Embedded', () => {
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

    test('should render business financing component when "Submit information" button in clicked', async ({ page, analyticsEvents }) => {
        const analyticsEventProperties = {
            ...sharedGrantsOverviewAnalyticsEventProperties,
            subCategory: 'Missing action',
            label: 'Submit information for AnaCredit button',
        };

        await page.getByText('Submit information').click();
        await expect(page.getByText('Additional information for business financing')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', analyticsEventProperties]]);
    });

    test('should indicate when business financing information is submitted successfully', async ({ page }) => {
        await page.getByRole('button', { name: 'Submit information', exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await page.getByRole('button', { name: 'Finish' }).click();
        await expect(page.getByText('Information submitted')).toBeVisible();
    });

    test('should render terms of service component when "Go to Terms & Conditions" button in clicked', async ({ page, analyticsEvents }) => {
        const analyticsEventProperties = {
            ...sharedGrantsOverviewAnalyticsEventProperties,
            subCategory: 'Missing action',
            label: 'Go to terms & conditions button clicked',
        };

        await page.getByRole('button', { name: 'Go to Terms & Conditions', exact: true }).click();
        await expect(page.getByRole('heading').getByText('Capital User Terms')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', analyticsEventProperties]]);
    });

    test('should indicate when terms of service are signed successfully', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to Terms & Conditions', exact: true }).click();
        await page.getByRole('combobox', { name: 'signer' }).click();
        await page.getByRole('option').first().click();
        await page
            .getByText(
                'I have read and I accept these terms and confirm that I am a legal representative authorized to accept these terms on behalf of the company. I have taken notice of the privacy statement (www.adyen.com/policies-and-disclaimer/privacy-policy) and I consent to my (personal) data being used for the purposes described therein.'
            )
            .click();
        await page.getByRole('button', { name: 'Sign and continue' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByRole('button', { name: 'Finish' }).click();
        await expect(page.getByText('Terms signed')).toBeVisible();
    });
});
