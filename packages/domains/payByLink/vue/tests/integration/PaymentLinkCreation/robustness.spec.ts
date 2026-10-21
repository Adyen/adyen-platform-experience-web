import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

test.describe('Payment link creation - Robustness', () => {
    test('Should infer the country of a prefilled phone without separators', async ({ page }) => {
        await goToStory(page, { id: 'mocked-pay-by-link-payment-link-creation--compact-prefilled-phone' });
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('combobox', { name: 'Country selector dropdown' })).toHaveText('TT (+1-868)');
        await expect(page.getByTestId('form-field-telephoneNumber').getByRole('textbox')).toHaveValue('410-6456');
    });

    test('Should ignore an invalid prefilled delivery date', async ({ page }) => {
        await goToStory(page, { id: 'mocked-pay-by-link-payment-link-creation--invalid-prefilled-date' });

        await expect(page.getByRole('combobox', { name: 'Delivery date' })).toHaveValue('Select a date');
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        const requestPromise = page.waitForRequest(request => request.method() === 'POST');
        await page.getByRole('button', { name: 'Create payment link' }).click();
        const request = await requestPromise;
        expect(request.postDataJSON()).not.toHaveProperty('deliverAt');
    });

    test('Should handle a stores request failure without an unhandled rejection', async ({ page }) => {
        const pageErrors: Error[] = [];
        page.on('pageerror', error => pageErrors.push(error));

        await goToStory(page, { id: 'mocked-pay-by-link-payment-link-creation--stores-network-error' });

        await expect(page.getByTestId('form-field-store').getByRole('combobox')).toBeVisible();
        expect(pageErrors).toEqual([]);
    });

    test('Should use the country dataset when the countries request fails', async ({ page }) => {
        const pageErrors: Error[] = [];
        page.on('pageerror', error => pageErrors.push(error));
        const countriesRequestFailed = page.waitForEvent('requestfailed', request => request.url().endsWith('/paybylink/countries'));

        await goToStory(page, { id: 'mocked-pay-by-link-payment-link-creation--countries-network-error' });
        await countriesRequestFailed;
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('combobox', { name: 'Country/Region' })).toBeVisible();
        expect(pageErrors).toEqual([]);
    });
});
