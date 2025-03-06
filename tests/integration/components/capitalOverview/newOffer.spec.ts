import { test, expect, Page } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-overview--new-offer';

const goToOfferSelection = async (page: Page) => await page.getByRole('button', { name: 'See new offer' }).click();

test.describe('New offer', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render "See new offer" button in grants screen', async ({ page }) => {
        await expect(page.getByText('Business financing')).toBeVisible();
        await expect(page.getByText('See new offer')).toBeVisible();
    });

    test('should go to offer selection screen with "Back" button when "See new offer" button is clicked', async ({ page }) => {
        await page.getByText('See new offer').click();
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    });

    test('should go back to grants screen when "Back" button in offer selection screen is clicked', async ({ page }) => {
        await goToOfferSelection(page);
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByText('Business financing')).toBeVisible();
    });

    test('should go to grants screen and show a new grant when "Request funds" button in offer summary screen is clicked', async ({ page }) => {
        await goToOfferSelection(page);
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
        await expect(page.getByText('Business financing')).toBeVisible();
        await expect(page.getByText('In progress')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});
