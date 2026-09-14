import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';
import type { Page } from '@playwright/test';

const STORY_ID = 'mocked-capital-capital-overview--early-renewal';

const getOfferModal = (page: Page) => page.getByRole('dialog');

const openOffer = async (page: Page) => {
    await page.getByRole('button', { name: 'Request a new loan' }).click();
};

const goToOfferSummary = async (page: Page) => {
    await openOffer(page);
    await getOfferModal(page).getByRole('button', { name: 'Review request' }).click();
};

test.describe('Early renewal', () => {
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
            expect(page.getByText('Business financing', { exact: true })).toBeVisible(),
            expect(page.getByText('You are now eligible to request a new loan up to €25,000')).toBeVisible(),
            expect(
                page.getByText(
                    "Part of this new loan amount will be used to repay your current loan's balance, and any outstanding fees on that loan will be waived."
                )
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new loan' })).toBeVisible(),
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
        await getOfferModal(page).getByRole('button', { name: 'Submit request (€18,600)' }).click();

        await expect(getOfferModal(page)).toBeHidden();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});
