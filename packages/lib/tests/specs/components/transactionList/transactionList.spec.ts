import { test as base, expect } from '@playwright/test';
import { TransactionListPage } from '../../../models/external-components/transactionList.page';
import { getTranslatedKey, scriptToAddInitialConfig } from '../../../utils/utils';
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
test('cells should show correct value and open correct modal ', async ({ transactionListPage, page }) => {
    const transactionDetails = transactionListPage;

    await transactionDetails.firstRow.click();

    await expect(page.getByRole('dialog').getByLabel(`${getTranslatedKey('paymentId')} Value`)).toHaveText('1WEPGD5VS767881Q');
});

test.describe('Filters', () => {
    test('all filters should be attached', async ({ transactionListPage }) => {
        const transactionDetails = transactionListPage;
        await expect(transactionDetails.filterBar).toBeAttached();
        await expect(transactionDetails.dateFilter).toBeAttached();
    });

    //TODO test('filtering by date range should work')
});
