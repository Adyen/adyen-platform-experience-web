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
        await expect(transactionDetails.balanceAccountFilter).toBeAttached();
        await expect(transactionDetails.accountHolderFilter).toBeAttached();
        await expect(transactionDetails.dateFilter).toBeAttached();
    });

    test('filtering by accountHolder should work', async ({ transactionListPage }) => {
        const transactionDetails = transactionListPage;

        await transactionDetails.accountHolderFilter.click();

        await transactionDetails.filterSingleInput.fill('AH3227C223222B5GG3XG7G5CF');
        await transactionDetails.applyFilterButton.click();
        await expect(transactionDetails.dataGridBody.getByRole('row')).toHaveCount(4);
        await transactionDetails.clearSingleInput('accountHolderFilter');
        await expect(transactionDetails.dataGridBody.getByRole('row')).toHaveCount(transactionListPage.gridCount);
    });

    test('filtering by balanceAccount should work', async ({ transactionListPage }) => {
        const transactionDetails = transactionListPage;

        await transactionDetails.balanceAccountFilter.click();

        await transactionDetails.filterSingleInput.fill('BA3227C223222B5CWF3T45SWD');
        await transactionDetails.applyFilterButton.click();
        await expect(transactionDetails.dataGridBody.getByRole('row')).toHaveCount(2);
        await transactionDetails.clearSingleInput('balanceAccountFilter');
        await expect(transactionDetails.dataGridBody.getByRole('row')).toHaveCount(transactionListPage.gridCount);
    });

    //TODO test('filtering by date range should work')
});
