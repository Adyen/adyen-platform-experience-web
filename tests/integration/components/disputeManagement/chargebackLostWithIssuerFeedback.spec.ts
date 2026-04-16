import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-lost-with-issuer-feedback';

test.describe('Chargeback - Lost (with issuer feedback)', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test("should render chargeback lost with issuer's feedback message", async ({ page }) => {
        await expect(page.getByText('Chargeback', { exact: true })).toBeVisible();
        await expect(page.getByText('Lost', { exact: true })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        await expect(page.getByText('The issuer came back with some feedback:')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Show more' })).toBeVisible();
    });
});
