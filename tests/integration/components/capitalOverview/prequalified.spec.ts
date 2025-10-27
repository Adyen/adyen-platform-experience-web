import { test, expect, type Page } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-overview--prequalified';

const goToOfferSummary = async (page: Page) => {
    await page.getByRole('button', { name: 'See options' }).click();
    await page.getByRole('button', { name: 'Review offer' }).click();
};

test.describe('Prequalified', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render prequalified intro screen', async ({ page }) => {
        await expect(page.getByText('Need some extra money?')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('You have been pre-qualified for business financing up to €25,000.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'See options' })).toBeVisible();
    });

    test('should go to offer selection screen with "Back" button when "See options" button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'See options' }).click();
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    test('should go back to prequalified intro screen when "Back" button in offer selection screen is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'See options' }).click();
        await page.getByRole('button', { name: 'Go back' }).click();
        await expect(page.getByText('Need some extra money?')).toBeVisible();
    });

    test('should go to grants screen and show a new grant when "Request funds" button in offer summary screen is clicked', async ({ page }) => {
        await goToOfferSummary(page);
        await page.getByRole('button', { name: 'Request funds' }).click();
        await expect(page.getByText('Business financing')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});

test.describe('onFundsRequest argument', () => {
    test('should not go to grants screen when argument is set and when "Request funds" button in offer summary screen is clicked', async ({
        page,
    }) => {
        await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
        await goToOfferSummary(page);
        await page.getByRole('button', { name: 'Request funds' }).click();
        await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
    });
});

test.describe('onOfferDismiss argument', () => {
    test('should not go back to prequalified intro screen when argument is set and when "Back" button in offer selection screen is clicked', async ({
        page,
    }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferDismiss: 'Enabled' } });
        await page.getByRole('button', { name: 'See options' }).click();
        await page.getByRole('button', { name: 'Go back' }).click();
        await expect(page.getByText('Need some extra money?')).toBeHidden();
    });
});

test.describe('onOfferOptionsRequest argument', () => {
    test('should not go to offer selection screen when argument is set and when "See options" button is clicked', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferOptionsRequest: 'Enabled' } });
        await page.getByRole('button', { name: 'See options' }).click();
        await expect(page.getByText('Business financing offer')).toBeHidden();
    });
});

test.describe('skipPreQualifiedIntro argument', () => {
    test('should render offer selection screen without "Back" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { skipPreQualifiedIntro: 'true' } });
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeHidden();
    });
});
