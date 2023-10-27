import { test as base, expect } from '@playwright/test';
import { TransactionListPage } from '../../../models/external-components/transactionList.page';
import { scriptToAddInitialConfig } from '../../../utils/utils';
import { resolve } from 'node:path';

const test = base.extend<{
    transactionListPage: TransactionListPage;
}>({
    transactionListPage: async ({ page, context }, use) => {
        const transactionListPage = new TransactionListPage(page);
        await scriptToAddInitialConfig(context, resolve(__dirname, 'init-config.js'));
        await transactionListPage.goto();
        await use(transactionListPage);
    },
});
test('balance account should show correct ID', async ({ transactionListPage, page }) => {
    const transactionDetails = transactionListPage;

    await expect(transactionDetails.paymentIdCell.locator('button')).not.toBeAttached();
    await expect(transactionDetails.balanceAccountCell).toBeAttached();
    await transactionDetails.accountHolderCell.click();
});
