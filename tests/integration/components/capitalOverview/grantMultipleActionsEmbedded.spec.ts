import { test, expect } from '../../../fixtures/analytics/events';
import type { PageAnalyticsEvent } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedActionAnalyticsEventProps, sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';
import type { Page } from '@playwright/test';

const STORY_ID = 'mocked-capital-capital-overview--grant-multiple-actions-embedded';

const submitBusinessFinancingInformation = async (page: Page) => {
    await page.getByRole('button', { name: 'Submit information', exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
};

const signTermsOfService = async (page: Page) => {
    await page.getByRole('button', { name: 'Sign terms & conditions', exact: true }).click();
    await page.getByRole('combobox', { name: 'signer' }).click();
    await page.getByRole('option').first().click();
    await page
        .getByText(
            'I have read and I accept these terms and confirm that I am a legal representative authorized to accept these terms on behalf of the company. I have taken notice of the privacy statement (www.adyen.com/policies-and-disclaimer/privacy-policy) and I consent to my (personal) data being used for the purposes described therein.'
        )
        .click();
    await page.getByRole('button', { name: 'Sign and continue' }).click();
};

const completeTermsOfService = async (page: Page) => {
    await signTermsOfService(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
};

const clickedButtonEvents = {
    submitInformationClicked: [
        'Clicked button',
        { ...sharedGrantsOverviewAnalyticsEventProperties, subCategory: 'Missing action', label: 'Submit information for AnaCredit button' },
    ],
    signTermsClicked: [
        'Clicked button',
        { ...sharedGrantsOverviewAnalyticsEventProperties, subCategory: 'Missing action', label: 'Go to terms & conditions button clicked' },
    ],
    dismissedAnaCredit: [
        'Clicked button',
        { ...sharedActionAnalyticsEventProps, subCategory: 'Information', label: 'Dismissed AnaCredit information' },
    ],
    submittedAnaCredit: [
        'Clicked button',
        { ...sharedActionAnalyticsEventProps, subCategory: 'Information', label: 'Submitted AnaCredit information' },
    ],
    dismissedTerms: [
        'Clicked button',
        { ...sharedActionAnalyticsEventProps, subCategory: 'Terms & conditions', label: 'Dismissed terms & conditions' },
    ],
    signedTerms: ['Clicked button', { ...sharedActionAnalyticsEventProps, subCategory: 'Terms & conditions', label: 'Signed terms & conditions' }],
    finishedTerms: [
        'Clicked button',
        { ...sharedActionAnalyticsEventProps, subCategory: 'Terms & conditions', label: 'Finished terms & conditions' },
    ],
} satisfies Record<string, [event: PageAnalyticsEvent['event'], properties: Partial<PageAnalyticsEvent['properties']>]>;

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
        await expect(page.getByRole('button', { name: 'Sign terms & conditions' })).toBeVisible();
    });

    test('should render business financing component when information submit button in clicked', async ({ page, analyticsEvents }) => {
        await page.getByText('Submit information').click();
        await expect(page.getByText('Additional information for business financing')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [clickedButtonEvents.submitInformationClicked]);
    });

    test('should dismiss business financing component when cancellation buttons are clicked', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Submit information', exact: true }).click();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await page.getByRole('button', { name: 'Leave' }).click();
        await expect(page.getByText('Submit information')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [clickedButtonEvents.submitInformationClicked, clickedButtonEvents.dismissedAnaCredit]);
    });

    test('should indicate when business financing information is submitted successfully', async ({ page, analyticsEvents }) => {
        await submitBusinessFinancingInformation(page);
        await expect(page.getByText('Information submitted')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [
            clickedButtonEvents.submitInformationClicked,
            clickedButtonEvents.dismissedAnaCredit,
            clickedButtonEvents.submittedAnaCredit,
        ]);
    });

    test('should render terms of service component when signing button in clicked', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Sign terms & conditions', exact: true }).click();
        await expect(page.getByRole('heading').getByText('Capital User Terms')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [clickedButtonEvents.signTermsClicked]);
    });

    test('should dismiss terms of service component when cancellation button is clicked', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Sign terms & conditions', exact: true }).click();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByText('Sign terms & conditions')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [clickedButtonEvents.signTermsClicked, clickedButtonEvents.dismissedTerms]);
    });

    test('should indicate when terms of service are signed successfully', async ({ page, analyticsEvents }) => {
        await signTermsOfService(page);
        await expectAnalyticsEvents(analyticsEvents, [clickedButtonEvents.signTermsClicked, clickedButtonEvents.signedTerms]);
    });

    test('should indicate when terms of service are completed successfully', async ({ page, analyticsEvents }) => {
        await completeTermsOfService(page);
        await expect(page.getByText('Terms signed')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, [
            clickedButtonEvents.signTermsClicked,
            clickedButtonEvents.signedTerms,
            clickedButtonEvents.dismissedTerms,
            clickedButtonEvents.finishedTerms,
        ]);
    });

    test('should indicate that all actions are completed', async ({ page }) => {
        await submitBusinessFinancingInformation(page);
        await completeTermsOfService(page);
        await expect(page.getByText('Pending')).toBeVisible();
        await expect(
            page.getByText('We received your information and we’re working on your request. Check back soon for the next steps.')
        ).toBeVisible();
    });
});
