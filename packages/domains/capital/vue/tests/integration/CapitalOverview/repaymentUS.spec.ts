import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--repayment-us';

test.describe('Repayment US', () => {
    test('should show US bank account details and verified bank accounts', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Send repayment', exact: true }).click();

        const repaymentModal = page.getByRole('dialog');

        await Promise.all([
            expect(repaymentModal.getByText('Add Adyen N.V. San Francisco Branch as a payee using your bank’s website or app.')).toBeVisible(),
            expect(repaymentModal.getByText('Account number', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('123456789012', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('Routing number', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('012345678', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('Adyen N.V. San Francisco Branch', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('US', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByRole('button', { name: /^Copy (account number|routing number|account owner)$/ })).toHaveCount(3),
            expect(repaymentModal.getByText('IBAN', { exact: true })).toBeHidden(),
            expect(repaymentModal.getByText('Sort code', { exact: true })).toBeHidden(),
        ]);
    });
});
