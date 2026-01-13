import { test, expect, type Page } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--new-offer';

const requestFunds = async (page: Page) => {
    await page.getByRole('button', { name: 'See new offer' }).click();
    await page.getByRole('button', { name: 'Review offer' }).click();
    await page.getByRole('button', { name: 'Request funds' }).click();
};

test.describe('New offer', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render "See new offer" button in grants screen', async ({ page }) => {
        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
        await expect(page.getByText('See new offer')).toBeVisible();
    });

    test('should go to offer selection screen with "Back" button when "See new offer" button is clicked', async ({ page }) => {
        await page.getByText('See new offer').click();
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    test('should go back to grants screen when "Back" button in offer selection screen is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'See new offer' }).click();
        await page.getByRole('button', { name: 'Go back' }).click();
        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
    });

    test('should go to grants screen and show a new grant when "Request funds" button in offer summary screen is clicked', async ({ page }) => {
        await requestFunds(page);
        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
        await expect(page.getByText('In progress')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});

test.describe('onFundsRequest argument', () => {
    test('should not go to grants screen when argument is set and "Request funds" button in offer summary screen is clicked', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
        await requestFunds(page);
        await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
    });
});
