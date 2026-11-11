import { expect, type Locator } from '@playwright/test';

/** Shows what is available, why it can't be cashed out (no alert without a message), and the form disabled. */
export const expectUnavailable = (root: Locator, { amount, message }: { amount: string; message?: string }) =>
    Promise.all([
        expect(root.getByRole('definition').filter({ hasText: amount })).toBeVisible(),
        message ? expect(root.getByRole('status')).toContainText(message) : expect(root.getByRole('status')).toHaveCount(0),
        // The standalone component doesn't offer contact support.
        expect(root.getByRole('button', { name: 'Reach out to support' })).toHaveCount(0),
        expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toBeDisabled(),
        expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toBeDisabled(),
        expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
    ]);
