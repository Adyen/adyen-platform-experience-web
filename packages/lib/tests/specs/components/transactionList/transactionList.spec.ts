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

    await expect(transactionDetails.paymentIdCell.locator('button')).not.toBeAttached();
    await expect(transactionDetails.paymentIdCell).toHaveText('1WEPGD5VS767881Q');
    await expect(transactionDetails.balanceAccountCell.locator('button')).toBeAttached();
    await expect(transactionDetails.balanceAccountCell).toHaveText('BA3227C223222B5CWF3T45SWD');
    await transactionDetails.balanceAccountCell.click();
    await expect(page.getByRole('dialog').getByLabel(getTranslatedKey('balanceAccountId')).getByLabel('value')).toHaveText(
        'BA3227C223222B5CWF3T45SWD'
    );
    await page.getByRole('dialog').getByLabel(getTranslatedKey('dismiss')).click();
    await transactionDetails.accountHolderCell.click();
    await expect(page.getByRole('dialog').getByLabel(getTranslatedKey('accountHolderID')).getByLabel('value')).toHaveText(
        'AH3227B2248HKJ5BHTQPKC5GX'
    );
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
