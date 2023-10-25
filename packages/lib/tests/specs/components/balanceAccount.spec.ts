import { test as base, expect } from '@playwright/test';
import { BalanceAccountPage } from '../../models/external-components/balanceAccount/balanceAccount.page';

const test = base.extend<{
    balanceAccountPage: BalanceAccountPage;
}>({
    balanceAccountPage: async ({ page }, use) => {
        const balanceAccountPage = new BalanceAccountPage(page);
        await balanceAccountPage.goto();
        await use(balanceAccountPage);
    },
});
test('balance account should show correct ID', async ({ balanceAccountPage }) => {
    const balanceAccount = balanceAccountPage;

    await expect(balanceAccount.balanceAccountValue).toHaveText('BA3227C223222B5CWF3T45SWD');
});
