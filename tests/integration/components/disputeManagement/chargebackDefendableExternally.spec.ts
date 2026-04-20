import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-defendable-externally';

test.describe('Chargeback - Defendable externally', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render contact support alert when chargeback is not defendable through the component', async ({ page }) => {
        await expect(page.getByText('Chargeback', { exact: true })).toBeVisible();
        await expect(page.getByText('Undefended', { exact: true })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        await expect(page.getByText('Contact support to defend this dispute.')).toBeVisible();
        await expect(page.getByText('The response deadline is')).toBeVisible();
    });
});
