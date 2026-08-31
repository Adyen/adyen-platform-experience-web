import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--custom-translations';
const INVALID_STORY_ID = 'mocked-reports-reports-overview--invalid-custom-translations';

test.describe('V2 domain translations', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('renders consumer copy for an exact locale through the domain boundary', async ({ page }) => {
        await expect(page.getByText('Mukautetut raportit', { exact: true })).toBeVisible();
        await expect(page.getByText('Mukautettu raporttikuvaus', { exact: true })).toBeVisible();
    });

    test('fills missing consumer values from the exact SDK locale', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Seuraava sivu', exact: true })).toBeVisible();
    });

    test('falls back to the SDK locale when a consumer template is invalid', async ({ page }) => {
        await goToStory(page, { id: INVALID_STORY_ID });

        await expect(page.getByText('Raportit', { exact: true })).toBeVisible();
        await expect(page.getByText('Invalid title', { exact: false })).toHaveCount(0);
    });
});
