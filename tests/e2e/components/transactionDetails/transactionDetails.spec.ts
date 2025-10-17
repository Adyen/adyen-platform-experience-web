import { test as base, expect } from '@playwright/test';
import { TransactionDetailsPage } from '../../../models/external-components/transactionDetails.page';
import { getTranslatedKey, goToStory } from '../../../utils/utils';

const COMPONENT_PREFIX = 'api-connected-transaction-details';

const test = base.extend<{
    transactionDetailsPage: TransactionDetailsPage;
}>({
    transactionDetailsPage: async ({ page }, use) => {
        const transactionDetailsPage = new TransactionDetailsPage(page);
        await use(transactionDetailsPage);
    },
});

test('should show correct balance account ID', async ({ transactionDetailsPage, page }) => {
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    await expect(transactionDetailsPage.referenceId).toHaveText('EVJN42CKX223223N5LV3B7V5VK2LT8EUR');
    const copyIcon = page.getByTestId('copy-icon');
    await expect(copyIcon).toBeVisible();
});

test('should show correct refund details', async ({ page }) => {
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    const refundType = page.getByText(getTranslatedKey('transactions.details.common.refundTypes.full'));
    await expect(refundType).toHaveText('Full');
    const refundReason = await page.getByLabel('Reason for refund Value').innerText();
    expect(refundReason).toStrictEqual(getTranslatedKey('transactions.details.common.refundReasons.requestedByCustomer'));
    const refundPSPReference = await page.getByLabel('Refund PSP Reference Value').innerText();
    expect(refundPSPReference).toStrictEqual('BXBZVHZH5S5H3275');
    const goToPayment = page.getByLabel('Go to payment');
    await expect(goToPayment).toHaveText(getTranslatedKey('transactions.details.actions.goToPayment'));
});

test('should go to payment details after button click', async ({ transactionDetailsPage, page }) => {
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    const goToPayment = page.getByLabel('Go to payment');
    await goToPayment.click();
    await expect(transactionDetailsPage.referenceId).toHaveText('EVJN4296S223223N5LQZCW83BL63NREUR');
    await expect(page.getByText('The full amount has been refunded back to the customer')).toBeVisible();
    const refundType = page.getByText(getTranslatedKey('transactions.details.common.refundedStates.full'));
    await expect(refundType).toHaveText('Fully refunded');
    const returnToRefund = page.getByLabel('Return to refund');
    await expect(returnToRefund).toHaveText(getTranslatedKey('transactions.details.actions.backToRefund'));
});

test('should return to refund details after button click', async ({ transactionDetailsPage, page }) => {
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    const goToPayment = page.getByLabel('Go to payment');
    await goToPayment.click();
    const returnToRefund = page.getByLabel('Return to refund');
    await expect(returnToRefund).toHaveText(getTranslatedKey('transactions.details.actions.backToRefund'));
    await returnToRefund.click();
    await expect(transactionDetailsPage.referenceId).toHaveText('EVJN42CKX223223N5LV3B7V5VK2LT8EUR');
});
