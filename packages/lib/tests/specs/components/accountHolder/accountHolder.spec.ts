import { test as base, expect } from '@playwright/test';
import { AccountHolderPage } from '../../../models/external-components/accountHolder.page';

const test = base.extend<{
    accountHolderPage: AccountHolderPage;
}>({
    accountHolderPage: async ({ page }, use) => {
        const accountHolderPage = new AccountHolderPage(page);
        await accountHolderPage.goto();
        await use(accountHolderPage);
    },
});
test('account holder should show correct ID', async ({ accountHolderPage }) => {
    const accountHolder = accountHolderPage;

    await expect(accountHolder.accountHolderValue).toHaveText('AH3227B2248HKJ5BHTQPKC5GX');
});
