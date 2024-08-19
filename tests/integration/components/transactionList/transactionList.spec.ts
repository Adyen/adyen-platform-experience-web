import { test as base, expect } from '@playwright/test';
import { TransactionListPage } from '../../../models/external-components/transactionList.page';
import { getTranslatedKey, scriptToAddInitialConfig } from '../../../utils/utils';
import { resolve } from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });
const filename = fileURLToPath(import.meta.url);

export const envDir = dirname(filename);

const test = base.extend<{
    transactionListPage: TransactionListPage;
}>({
    transactionListPage: async ({ page, context }, use) => {
        const transactionListPage = new TransactionListPage(page);
        await scriptToAddInitialConfig(context, resolve(envDir, 'init-config.js'));
        await transactionListPage.goto();
        await use(transactionListPage);
    },
});

test('cells should show correct value and open correct modal ', async ({ transactionListPage }) => {
    const transactionList = transactionListPage;

    await transactionList.applyDateFilter('2024-01-01');
    await transactionList.getCell('amount').waitFor();
    await transactionList.firstRow.click();

    const referenceID = transactionList.page.getByRole('dialog').getByLabel(`${getTranslatedKey('referenceID')}`);
    await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
});

test.describe('Filters', () => {
    test('all filters should be attached', async ({ transactionListPage }) => {
        const transactionList = transactionListPage;
        await expect(transactionList.filterBar).toBeAttached();
        await expect(transactionList.dateFilter).toBeAttached();
    });

    //TODO test('filtering by date range should work')
});

base('TESTTESTTEST', async ({ page }) => {
    await page.goto(`http://localhost:${process.env.PLAYGROUND_PORT}/iframe.html?id=mocked-transactions-list--basic`);
    await expect(page.locator('.adyen-pe-component')).toBeAttached();
});
