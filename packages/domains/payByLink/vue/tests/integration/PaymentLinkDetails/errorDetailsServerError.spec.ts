import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--error-details-server-error';
const REQUEST_ID = '769ac4ce59f0f159ad672d38d3291e91';

test.describe('Error - Details (server error)', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
    });

    test('should render error code with button to contact support', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const errorMessage = page.getByText("We couldn't load the payment link details.");

        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(errorMessage).toContainText(`The error code is ${REQUEST_ID}`),
            expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeVisible(),
        ]);
        await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeHidden();
    });

    test('should ask to contact support with error code when onContactSupport is not provided', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Disabled' } });

        const errorMessage = page.getByText("We couldn't load the payment link details.");

        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(errorMessage).toContainText(`Contact support for help and share error code ${REQUEST_ID}`),
        ]);
        await Promise.all([
            expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeHidden(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeHidden(),
        ]);
    });
});
