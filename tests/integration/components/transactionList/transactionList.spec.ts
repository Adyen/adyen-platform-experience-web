import { test as base, expect } from '@playwright/test';
import { TransactionListPage } from '../../../models/external-components/transactionList.page';
import { getTranslatedKey, goToPage } from '../../../utils/utils';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const COMPONENT_PREFIX = 'mocked-transactions-list';

const test = base.extend<{
    transactionListPage: TransactionListPage;
}>({
    transactionListPage: async ({ page }, use) => {
        const transactionListPage = new TransactionListPage(page);
        await use(transactionListPage);
    },
});

test('cells should show correct value and open correct modal ', async ({ transactionListPage, page }) => {
    const transactionList = transactionListPage;
    await goToPage({ page, id: `${COMPONENT_PREFIX}--basic` });
    await transactionList.applyDateFilter('2024-01-01');
    await transactionList.getCell('amount').waitFor();
    await transactionList.firstRow.click();

    const referenceID = transactionList.page.getByRole('dialog').getByLabel(`${getTranslatedKey('referenceID')}`);
    await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
});

test.describe('Filters', () => {
    test('all filters should be attached', async ({ transactionListPage, page }) => {
        await goToPage({ page, id: `${COMPONENT_PREFIX}--basic` });
        const transactionList = transactionListPage;
        await expect(transactionList.filterBar).toBeAttached();
        await expect(transactionList.dateFilter).toBeAttached();
    });

    //TODO test('filtering by date range should work')
});
