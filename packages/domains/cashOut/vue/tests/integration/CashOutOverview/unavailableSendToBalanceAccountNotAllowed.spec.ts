import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--send-to-balance-account-not-allowed';

test.describe('CashOut Overview - Unavailable - Send to balance account not allowed', () => {
    test('should explain that cashOut is not allowed for this account, and not offer to start one', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await expectUnavailable(root, {
            amount: '€1,000.00',
            message: "Instant CashOut isn't available for this account. Contact support for help.",
        });
        await expect(root.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });

    test('should offer contact support when the integration handles it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        const status = getComponentRoot(page).getByRole('status');

        await expect(status.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
        // The button already offers it, so the message doesn't also ask to contact support
        await expect(status).toContainText("Instant CashOut isn't available for this account.");
        await expect(status).not.toContainText('Contact support for help');
    });

    // Beside the message, the button squeezes it into a narrow column
    test('should show the reach out button below the message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        const status = getComponentRoot(page).getByRole('status');
        const message = status.getByText("Instant CashOut isn't available for this account.", { exact: true });
        const button = status.getByRole('button', { name: 'Reach out to support' });
        await Promise.all([expect(message).toBeVisible(), expect(button).toBeVisible()]);

        const [messageBox, buttonBox] = await Promise.all([message.boundingBox(), button.boundingBox()]);

        expect(buttonBox!.y).toBeGreaterThanOrEqual(messageBox!.y + messageBox!.height);
    });

    test('should keep the text size of the message when offering contact support', async ({ page }) => {
        const fontSizeOf = async (args?: Record<string, string>) => {
            await goToStory(page, { id: STORY_ID, args });
            const message = getComponentRoot(page).getByRole('status').getByText("Instant CashOut isn't available for this account.");
            await expect(message).toBeVisible();
            return message.evaluate(element => getComputedStyle(element).fontSize);
        };

        const withoutContactSupport = await fontSizeOf();
        const withContactSupport = await fontSizeOf({ onContactSupport: 'Enabled' });

        expect(withContactSupport).toBe(withoutContactSupport);
    });

    test('should show the reach out button in the text size of the message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        const status = getComponentRoot(page).getByRole('status');
        const message = status.getByText("Instant CashOut isn't available for this account.", { exact: true });
        const button = status.getByRole('button', { name: 'Reach out to support' });
        await Promise.all([expect(message).toBeVisible(), expect(button).toBeVisible()]);

        const fontSizeOf = (element: HTMLElement) => getComputedStyle(element).fontSize;
        const [messageSize, buttonSize] = await Promise.all([
            message.evaluate(fontSizeOf),
            button.getByText('Reach out to support', { exact: true }).evaluate(fontSizeOf),
        ]);

        expect(buttonSize).toBe(messageSize);
    });
});
