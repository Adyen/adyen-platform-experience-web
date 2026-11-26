import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--repayment-gb';

test.describe('Repayment GB', () => {
    test('should show GB bank account details and verified bank accounts', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Send repayment', exact: true }).click();

        const repaymentModal = page.getByRole('dialog');

        await Promise.all([
            expect(repaymentModal.getByText('Add Adyen N.V. London Branch as a payee using your bank’s website or app.')).toBeVisible(),
            expect(repaymentModal.getByText('IBAN', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('GB01 ADYB 0123 4567 8901 23', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('Account number', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('123456789012', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('Sort code', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('012345678', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('Adyen N.V. London Branch', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('GB', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByRole('button', { name: /^Copy (IBAN|account number|sort code|account owner)$/ })).toHaveCount(4),
            expect(repaymentModal.getByText('Routing number', { exact: true })).toBeHidden(),
        ]);
    });
});
