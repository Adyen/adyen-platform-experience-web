import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { waitForCashOutRequest } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--ineligible-transfer-instruments';

test.describe('CashOut Request - Ineligible transfer instruments', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should not offer to cash out before a bank account is selected', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveText('Select a bank account'),
            expect(root.getByRole('status')).toContainText('You will receive $216.20'),
            expect(root.getByRole('status')).toContainText('The money will be in your account within 30 minutes.'),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
        ]);
    });

    test('should list the bank accounts that can receive the cashOut first, and the others disabled with their reason', async ({ page }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        const options = root.getByRole('listbox', { name: 'Account to deposit into' }).getByRole('option');

        await expect(options).toHaveCount(5);
        await Promise.all([
            expect(options.nth(0)).toHaveAccessibleName('NL**ABNA******4300'),
            expect(options.nth(1)).toHaveAccessibleName('GB**NWBK**********1234'),
            expect(options.nth(2)).toHaveAccessibleName('********5678'),
            expect(options.nth(2)).toBeEnabled(),
            expect(options.nth(3)).toHaveAccessibleName("GB**BARC**********5432 This account can't receive instant payouts."),
            expect(options.nth(3)).toBeDisabled(),
            expect(options.nth(4)).toHaveAccessibleName("********9012 This account can't receive payouts in USD."),
            expect(options.nth(4)).toBeDisabled(),
        ]);
    });

    test('should show the form for another balance account once it is selected', async ({ page }) => {
        const root = getComponentRoot(page);
        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: '********5678' }).click();

        await root.getByRole('combobox', { name: 'Balance account' }).click();
        await root.getByRole('option', { name: 'S. Hopper - Secondary Account' }).click();

        await Promise.all([
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('1000.00'),
            expect(root.getByRole('definition')).toHaveText(['€1,000.00', '€15.50']),
            expect(root.getByRole('status')).toContainText('You will receive €984.50'),
            // The bank account selected for the previous balance account doesn't carry over.
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveText('Select a bank account'),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
        ]);
    });

    test('should cash out to the selected bank account', async ({ page }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: '********5678' }).click();
        await expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveText('********5678');

        const cashOutRequest = waitForCashOutRequest(page);
        await root.getByRole('button', { name: 'Cash out now' }).click();

        expect((await cashOutRequest).postDataJSON()).toMatchObject({ counterparty: { transferInstrumentId: 'SE322LJ223222F5GXZFNM5D7M' } });
        await expect(root.getByText('CashOut successful')).toBeVisible();
    });
});
