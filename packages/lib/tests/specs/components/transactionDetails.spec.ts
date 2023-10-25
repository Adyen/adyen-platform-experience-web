import { test as base, expect } from '@playwright/test';
import { TransactionDetailsPage } from '../../models/external-components/transactionDetails/transactionDetails.page';

const test = base.extend<{
    transactionDetailsPage: TransactionDetailsPage;
}>({
    transactionDetailsPage: async ({ page }, use) => {
        const transactionDetailsPage = new TransactionDetailsPage(page);
        await transactionDetailsPage.goto();
        await use(transactionDetailsPage);
    },
});
test('balance account should show correct ID', async ({ transactionDetailsPage }) => {
    const transactionDetails = transactionDetailsPage;

    await expect(transactionDetails.transactionValue).toHaveText('1VVF0D5V3709DX6D');
});
