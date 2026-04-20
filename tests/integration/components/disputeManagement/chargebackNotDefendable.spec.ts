import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-not-defendable';

test.describe('Chargeback - Not defendable', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render chargeback not-defendable alert message if not actionable, but needs action', async ({ page }) => {
        await expect(page.getByText('Chargeback', { exact: true })).toBeVisible();
        await expect(page.getByText('Undefended', { exact: true })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        await expect(page.getByText('This chargeback can’t be defended. Contact support for details.')).toBeVisible();
    });
});
