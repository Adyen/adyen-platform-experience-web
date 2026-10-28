import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--single-balance-account';

test.describe('CashOut Overview - Single balance account (or balance account session)', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show what the balance account can cash out, without a balance account selector', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('heading', { name: 'Instant CashOut' })).toBeVisible(),
            expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveCount(0),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
    });

    test('should open the request without a balance account selector either', async ({ page }) => {
        const modal = await openRequestModal(page);

        await Promise.all([
            expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('220.00'),
            expect(modal.getByRole('combobox', { name: 'Balance account' })).toHaveCount(0),
        ]);
    });
});
