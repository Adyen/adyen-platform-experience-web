import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { waitForCashOutRequest } from '../shared/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--default';

test.describe('CashOut Overview - Default', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    const AVAILABLE_TO_CASH_OUT_TOOLTIP = 'You can cash out up to your pending balance, subject to a cap per rolling 24-hour period.';

    test.describe('Render', () => {
        test('should show what the selected balance account can cash out', async ({ page }) => {
            const root = getComponentRoot(page);

            await Promise.all([
                expect(root.getByRole('heading', { name: 'Instant CashOut' })).toBeVisible(),
                expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(root.getByText('Available to cash out')).toBeVisible(),
                expect(root.getByLabel(AVAILABLE_TO_CASH_OUT_TOOLTIP)).toBeVisible(),
                expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
                expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
            ]);
        });

        test('should explain what is available to cash out when its info icon is hovered', async ({ page }) => {
            const tooltip = page.getByTestId('focus-trap').getByText(AVAILABLE_TO_CASH_OUT_TOOLTIP);

            await getComponentRoot(page).getByLabel(AVAILABLE_TO_CASH_OUT_TOOLTIP).hover();
            await tooltip.waitFor();
            await expect(tooltip).toBeVisible();
        });

        test('should show what another balance account can cash out once it is selected', async ({ page }) => {
            const root = getComponentRoot(page);

            await root.getByRole('combobox', { name: 'Balance account' }).click();
            await root.getByRole('option', { name: 'S. Hopper - Secondary Account' }).click();

            await Promise.all([
                expect(root.getByText('€1,000.00', { exact: true })).toBeVisible(),
                // Whether a cashOut can be started depends on the eligibility of the selected balance account.
                expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
            ]);
        });
    });

    test.describe('Request', () => {
        test('should open the request for the selected balance account, with all it can cash out', async ({ page }) => {
            const modal = await openRequestModal(page);

            await Promise.all([
                expect(modal.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('220.00'),
                // Each value with its label, in the order they are shown.
                expect(modal.getByRole('term')).toHaveCount(2),
                expect(modal.getByRole('term')).toContainText(['Available to cash out', 'Fees']),
                expect(modal.getByLabel(AVAILABLE_TO_CASH_OUT_TOOLTIP)).toBeVisible(),
                expect(modal.getByLabel('The fee is taken out of the amount you cash out.')).toBeVisible(),
                expect(modal.getByRole('definition')).toHaveText(['$220.00', '$3.80']),
                expect(modal.getByRole('status')).toContainText('You will receive $216.20'),
                expect(modal.getByRole('status')).toContainText('The money will be in your account within 30 minutes.'),
                expect(modal.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
            ]);
        });

        test('should list the bank accounts that can receive the cashOut first, and the others disabled with their reason', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            const options = modal.getByRole('listbox', { name: 'Account to deposit into' }).getByRole('option');

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

        test('should update the fees and what will be received for another amount', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');

            await Promise.all([
                expect(modal.getByRole('definition').filter({ hasText: '$2.00' })).toBeVisible(),
                expect(modal.getByRole('status')).toContainText('You will receive $98.00'),
            ]);
        });

        test('should keep what is available to cash out when the request is closed without cashing out', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('button', { name: 'Close' }).click();

            await expect(modal).toBeHidden();
            await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();
        });
    });

    test.describe('Cash out', () => {
        test('should cash out, then show less available to cash out once the request is closed', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');
            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
            await expect(modal.getByRole('status')).toContainText('You will receive $98.00');

            const cashOutRequest = waitForCashOutRequest(page);
            await modal.getByRole('button', { name: 'Cash out now' }).click();

            // The fees are shown, but not sent: the API calculates them itself.
            expect((await cashOutRequest).postDataJSON()).toEqual({
                amount: 10000,
                currency: 'USD',
                counterparty: { transferInstrumentId: 'SE322KH223222F5GXZFNM3BGP' },
            });
            await Promise.all([
                expect(modal.getByText('CashOut successful')).toBeVisible(),
                expect(modal.getByText('You can expect your money to be in your account within 30 minutes.')).toBeVisible(),
                expect(modal.getByRole('button', { name: 'Cash out now' })).toBeHidden(),
                // Only the close button of the modal: the request in the modal has no close button of its own.
                expect(modal.getByRole('button', { name: 'Close' })).toHaveCount(1),
            ]);

            await modal.getByRole('button', { name: 'Close' }).click();

            await expect(modal).toBeHidden();
            await expect(getComponentRoot(page).getByText('$120.00', { exact: true })).toBeVisible();
        });
    });
});
