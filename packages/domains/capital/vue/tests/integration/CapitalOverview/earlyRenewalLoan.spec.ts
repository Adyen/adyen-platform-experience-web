import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';
import type { Page } from '@playwright/test';

const STORY_ID = 'mocked-capital-capital-overview--early-renewal-loan';

const getOfferButton = (page: Page) => page.getByTestId('capital-header').getByRole('button', { name: 'Request a new loan' });

const getOfferModal = (page: Page) => page.getByRole('dialog');

const openOffer = async (page: Page) => {
    await getOfferButton(page).click();
};

const goToOfferSummary = async (page: Page) => {
    await openOffer(page);
    await getOfferModal(page).getByRole('button', { name: 'Review request' }).click();
};

test.describe('Early renewal - Loan', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Landed on page',
                {
                    ...sharedCapitalOverviewAnalyticsEventProperties,
                    hasGrants: true,
                    hasOffer: true,
                    isEarlyRenewal: true,
                },
            ],
        ]);
    });

    test('should render new loan alert in grants screen', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Adyen Capital', { exact: true })).toBeVisible(),
            expect(page.getByText('You are now eligible to request a new loan up to €25,000')).toBeVisible(),
            expect(
                page.getByText(
                    'If you accept, a portion of your new loan will automatically be deducted to repay your remaining current loan, and any remaining fee on it will be waived.'
                )
            ).toBeVisible(),
            expect(getOfferButton(page)).toBeVisible(),
        ]);
    });

    test('should open offer in a modal when new loan button is clicked', async ({ page }) => {
        await openOffer(page);
        await expect(getOfferModal(page)).toBeVisible();
        await expect(getOfferModal(page).getByText('Business financing request')).toBeVisible();
    });

    test('should go back to grants screen when offer modal is closed', async ({ page }) => {
        await openOffer(page);
        await getOfferModal(page).getByRole('button', { name: 'Close' }).click();
        await expect(getOfferModal(page)).toBeHidden();
    });

    test('should go to grants screen and show a new grant when request submit button in offer summary screen is clicked', async ({ page }) => {
        await goToOfferSummary(page);
        await getOfferModal(page).getByRole('button', { name: 'Submit €18,600 request' }).click();

        await expect(getOfferModal(page)).toBeHidden();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});
