import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--error-list-server-error';
const REQUEST_ID = '769ac4ce59f0f159ad672d38d3291e91';

test.describe('Error - List (server error)', () => {
    test('should render error message with error code and no actions', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText("We couldn't load your payouts.", { exact: true })).toBeVisible(),
            expect(page.getByText(`Contact support for help and share error code ${REQUEST_ID}`, { exact: true })).toBeVisible(),
        ]);
        await Promise.all([
            expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeHidden(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeHidden(),
        ]);
    });
});

test.describe('onContactSupport argument', () => {
    test('should render error message with button to contact support', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText("We couldn't load your payouts.", { exact: true })).toBeVisible(),
            expect(page.getByText(`The error code is ${REQUEST_ID}`, { exact: true })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Reach out to support', exact: true, disabled: false })).toBeVisible(),
        ]);
        await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeHidden();
    });
});
