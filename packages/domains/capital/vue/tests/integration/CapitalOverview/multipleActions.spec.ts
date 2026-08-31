import type { Page } from '@playwright/test';
import { test, expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import {
    sharedActionAnalyticsEventProps,
    sharedGrantsOverviewAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--multiple-actions';

const submitBusinessFinancingInformation = async (page: Page) => {
    await page.getByRole('button', { name: 'Submit information', exact: true }).click();

    const balanceSheetTotalInput = page.getByRole('textbox', { name: /Balance sheet total/i });
    await balanceSheetTotalInput.fill('100');
    await balanceSheetTotalInput.blur();

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
    await page.getByRole('button', { name: 'Sign', exact: true }).click();
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

test.describe('Multiple actions', () => {
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

    test('should render business financing component when information submit button is clicked', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Submit information', exact: true }).click();
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

        await expectAnalyticsEvents(analyticsEvents, [clickedButtonEvents.submitInformationClicked, clickedButtonEvents.submittedAnaCredit]);
    });

    test('should render terms of service component when signing button is clicked', async ({ page, analyticsEvents }) => {
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
            clickedButtonEvents.finishedTerms,
        ]);
    });

    test('should indicate that all actions are completed', async ({ page }) => {
        await submitBusinessFinancingInformation(page);
        await completeTermsOfService(page);

        await Promise.all([
            expect(page.getByText('Pending')).toBeVisible(),
            expect(
                page.getByText('We received your information and we’re working on your request. Check back soon for the next steps.')
            ).toBeVisible(),
        ]);
    });
});
