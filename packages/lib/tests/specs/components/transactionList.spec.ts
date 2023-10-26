import { test as base, expect } from '@playwright/test';
import { TransactionListPage } from '../../models/external-components/transactionList.page';

const test = base.extend<{
    transactionListPage: TransactionListPage;
}>({
    transactionListPage: async ({ page }, use) => {
        const transactionListPage = new TransactionListPage(page);
        await transactionListPage.goto();
        await use(transactionListPage);
    },
});
test('balance account should show correct ID', async ({ transactionListPage }) => {
    const transactionDetails = transactionListPage;

    await expect(transactionDetails.dataGrid).toBeAttached();
});
