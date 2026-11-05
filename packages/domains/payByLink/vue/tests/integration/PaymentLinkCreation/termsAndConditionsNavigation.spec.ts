import { test, expect, type Page, type Request } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';

const isStoreSettingsRequest = (request: Request, method: 'GET' | 'POST') =>
    request.method() === method && request.url().includes('/paybylink/settings/STORE_AMS_001');

test.describe('Payment link creation - Terms and conditions setup', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    const openTermsAndConditionsSetup = async (page: Page) => {
        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: 'AM001' }).click();

        await expect(page.getByText('Terms and Conditions Setup Required')).toBeVisible();
        await page.getByRole('button', { name: 'Set up Terms and Conditions' }).click();

        await expect(page.getByRole('textbox', { name: 'Your terms and conditions URL' })).toBeVisible();
    };

    test('navigates to terms and conditions settings and restores the selected store on return', async ({ page }) => {
        const storeField = page.getByTestId('form-field-store');

        await openTermsAndConditionsSetup(page);
        await expect(page.getByRole('button', { name: 'Theme' })).toHaveCount(0);

        const settingsRequest = page.waitForRequest(request => isStoreSettingsRequest(request, 'GET'));
        await page.getByRole('button', { name: 'Go back' }).click();
        await settingsRequest;

        await expect(storeField).toBeVisible();
        await expect(storeField.getByRole('combobox')).toHaveText('Main Store - Amsterdam');
    });

    test('allows continuing after saving terms and conditions without refetching the settings', async ({ page }) => {
        const storeField = page.getByTestId('form-field-store');

        await openTermsAndConditionsSetup(page);
        await page.getByRole('textbox', { name: 'Your terms and conditions URL' }).fill('https://example.com/terms');
        await page.getByRole('button', { name: 'all requirements.' }).click();
        await page.getByRole('button', { name: 'Confirm requirements' }).click();

        const settingsRefetches: Request[] = [];
        page.on('request', request => {
            if (isStoreSettingsRequest(request, 'GET')) settingsRefetches.push(request);
        });

        const saveRequest = page.waitForRequest(request => isStoreSettingsRequest(request, 'POST'));
        await page.getByRole('button', { name: 'Save' }).click();
        await saveRequest;

        await expect(storeField.getByRole('combobox')).toHaveText('Main Store - Amsterdam');
        await Promise.all([
            expect(page.getByText('Terms and Conditions Setup Required')).toBeHidden(),
            expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled(),
        ]);
        expect(settingsRefetches).toHaveLength(0);
    });
});
