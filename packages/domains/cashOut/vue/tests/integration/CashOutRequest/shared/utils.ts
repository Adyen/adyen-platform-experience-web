import { expect, type Locator } from '@playwright/test';

/** Shows what is available, also in the disabled amount field, why it can't be cashed out (no alert without a message), no fee, and the form disabled. */
export const expectUnavailable = (root: Locator, { amount, message }: { amount: string; message?: string }) =>
    Promise.all([
        expect(root.getByText(`You have ${amount} available to cash out`)).toBeVisible(),
        expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue(amount.replace(/[^\d.]/g, '')),
        expect(root.getByRole('definition')).toHaveText(['--']),
        message ? expect(root.getByRole('status')).toContainText(message) : expect(root.getByRole('status')).toHaveCount(0),
        // The standalone component doesn't offer contact support.
        expect(root.getByRole('button', { name: 'Reach out to support' })).toHaveCount(0),
        expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toBeDisabled(),
        expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toBeDisabled(),
        expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
    ]);
