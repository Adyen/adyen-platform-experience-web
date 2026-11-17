import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--some-available-amounts-missing';

test.describe('CashOut Overview - Some available amounts missing', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show the selected balance account as usual', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
    });

    // The API sends no amount for one balance account and leaves another out, so only the others show what they can cash out.
    test('should show what a balance account can cash out only when the API tells it', async ({ page }) => {
        const root = getComponentRoot(page);
        await root.getByRole('combobox', { name: 'Balance account' }).click();

        const mainAccount = root.getByRole('option', { name: 'S. Hopper - Main Account' });
        const secondaryAccount = root.getByRole('option', { name: 'S. Hopper - Secondary Account' });
        const unnamedAccount = root.getByRole('option', { name: 'BA32272223222B5CTDQPM6W2K' });

        await Promise.all([
            expect(mainAccount).toContainText('BA32272223222B5CTDQPM6W2H · $220.00 to cash out'),
            expect(secondaryAccount).toContainText('BA32272223222B5CTDQPM6W2G'),
            expect(secondaryAccount).not.toContainText('to cash out'),
            expect(unnamedAccount).toBeVisible(),
            expect(unnamedAccount).not.toContainText('to cash out'),
        ]);
    });
});
