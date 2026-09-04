import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';
import { goToOfferSelection, goToOfferSummary } from '../../../../fixtures/CapitalOverview/integration/utils';

const STORY_ID = 'mocked-capital-capital-overview--early-renewal';

test.describe('Early renewal', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
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

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should go to offer selection screen with "Back" button when new loan button is clicked', async ({ page }) => {
        await goToOfferSelection(page);
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should go back to grants screen when "Back" button in offer selection screen is clicked', async ({ page }) => {
        await goToOfferSelection(page);
        await page.getByRole('button', { name: 'Go back' }).click();

        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should go to grants screen and show a new grant when request submit button in offer summary screen is clicked', async ({ page }) => {
        await goToOfferSummary(page);
        await page.getByRole('button', { name: 'Submit request (€18,600)' }).click();

        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});

test.describe('onFundsRequest argument', () => {
    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should not go to grants screen when argument is set and request submit button in offer summary screen is clicked',
        async ({ page }) => {
            await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
            await goToOfferSummary(page);
            await page.getByRole('button', { name: 'Submit request (€18,600)' }).click();

            await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
        }
    );
});
