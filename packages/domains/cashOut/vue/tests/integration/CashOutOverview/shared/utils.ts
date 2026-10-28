import { expect, type Locator, type Page } from '@playwright/test';
import { getComponentRoot } from '@integration-components/testing/playwright/utils';

const getRequestModal = (page: Page) => page.getByRole('dialog', { name: 'Instant CashOut request' });

export const openRequestModal = async (page: Page) => {
    await getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' }).click();
    await expect(getRequestModal(page)).toBeVisible();
    return getRequestModal(page);
};

/** Shows what is available, why it can't be cashed out (no alert without a message), and doesn't offer to start a cashOut. */
export const expectUnavailable = (root: Locator, { amount, message }: { amount: string; message?: string }) =>
    Promise.all([
        expect(root.getByText(amount, { exact: true })).toBeVisible(),
        message ? expect(root.getByRole('status')).toContainText(message) : expect(root.getByRole('status')).toHaveCount(0),
        expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeDisabled(),
    ]);
