import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { waitForCashOutRequest } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--single-eligible-transfer-instrument';

test.describe('CashOut Request - Single eligible transfer instrument', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should select the only bank account that can receive the cashOut', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            // With other bank accounts that can't receive it, they are listed in a dropdown instead of shown as a detail.
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveText('NL**ABNA******4300'),
            expect(root.getByRole('status')).toContainText('You will receive €984.50'),
            expect(root.getByRole('status')).toContainText('The money will be in your account within 30 minutes.'),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeEnabled(),
        ]);
    });

    test('should list the other bank accounts disabled with the reason they cannot receive the cashOut', async ({ page }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        const options = root.getByRole('listbox', { name: 'Account to deposit into' }).getByRole('option');

        await expect(options).toHaveCount(3);
        await Promise.all([
            expect(options.nth(0)).toContainText('NL**ABNA******4300'),
            expect(options.nth(0)).toHaveAttribute('aria-selected', 'true'),
            expect(options.nth(0)).toBeEnabled(),
            expect(options.nth(1)).toHaveAccessibleName("GB**BARC**********5432 This account can't receive instant payouts."),
            expect(options.nth(1)).toBeDisabled(),
            expect(options.nth(2)).toHaveAccessibleName("********9012 This account can't receive payouts in EUR."),
            expect(options.nth(2)).toBeDisabled(),
        ]);
    });

    test('should cash out to the selected bank account', async ({ page }) => {
        const root = getComponentRoot(page);
        await expect(root.getByRole('button', { name: 'Cash out now' })).toBeEnabled();

        const cashOutRequest = waitForCashOutRequest(page);
        await root.getByRole('button', { name: 'Cash out now' }).click();

        expect((await cashOutRequest).postDataJSON()).toMatchObject({ counterparty: { transferInstrumentId: 'SE322KH223222F5GXZFNM3BGP' } });
        await expect(root.getByText('CashOut successful')).toBeVisible();
    });
});
