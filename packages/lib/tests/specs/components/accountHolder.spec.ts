import { test as base, expect } from '@playwright/test';
import { AccountHolderPage } from '../../models/accountHolder/accountHolder.page';

const test = base.extend<{
    accountHolderPage: AccountHolderPage;
}>({
    accountHolderPage: async ({ page }, use) => {
        const accountHolderPage = new AccountHolderPage(page);
        await accountHolderPage.goto();
        await use(accountHolderPage);
    },
});
test('should select highlighted issuer and update pay button label', async ({ accountHolderPage }) => {
    const accountHolder = accountHolderPage;

    await expect(accountHolder.accountHolderValue).toHaveText('AH3227B2248HKJ5BHTQPKC5GX');
});
