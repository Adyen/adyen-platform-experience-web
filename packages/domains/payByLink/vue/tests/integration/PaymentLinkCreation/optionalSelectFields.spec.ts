import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--optional-select-fields';

test.beforeEach(async ({ page }) => {
    await setTime(page);
    await goToStory(page, { id: STORY_ID });
});

test.describe('Payment link creation - Optional select fields', () => {
    test('Should clear optional dropdowns and omit their values from the payment link request', async ({ page }) => {
        const validityUnit = page.getByTestId('form-field-linkValidity.quantity');
        await validityUnit.getByRole('combobox').click();
        await validityUnit.getByRole('button', { name: 'Clear selection' }).click();
        await expect(validityUnit.getByRole('combobox')).toHaveText('Select option');
        await page.getByRole('option', { name: 'hours', exact: true }).click();

        const validity = page.getByTestId('form-field-linkValidity.durationUnit');
        await validity.getByRole('combobox').click();
        await validity.getByRole('button', { name: 'Clear selection' }).click();
        await Promise.all([expect(validity.getByRole('combobox')).toHaveText('Select option'), expect(validityUnit).toBeHidden()]);

        const linkType = page.getByTestId('form-field-linkType');
        await linkType.getByRole('combobox').click();
        await linkType.getByRole('button', { name: 'Clear selection' }).click();
        await expect(linkType.getByRole('combobox')).toHaveText('Link type');
        await page.getByRole('button', { name: 'Continue' }).click();

        for (const name of ['countryCode', 'deliveryAddress.country', 'shopperLocale']) {
            const field = page.getByTestId(`form-field-${name}`);
            await field.getByRole('combobox').click();
            await field.getByRole('button', { name: 'Clear selection' }).click();
            await field.getByRole('combobox').press('Escape');
            await expect(field.getByRole('combobox')).toHaveText(name === 'shopperLocale' ? 'Language' : 'Select option');
        }

        for (const name of ['street', 'houseNumberOrName', 'city', 'postalCode']) {
            await page.getByTestId(`form-field-deliveryAddress.${name}`).getByRole('textbox').fill('');
        }

        await page.getByRole('button', { name: 'Continue' }).click();
        const createButton = page.getByRole('button', { name: 'Create payment link' });
        await expect(createButton).toBeVisible();
        const requestPromise = page.waitForRequest(request => request.method() === 'POST' && request.url().includes('/paybylink/paymentLinks'));
        await createButton.click();
        const request = await requestPromise;
        const payload = request.postDataJSON();
        for (const name of ['linkType', 'linkValidity', 'countryCode', 'deliveryAddress.country', 'shopperLocale']) {
            expect(payload).not.toHaveProperty(name);
        }
        await expect(page.getByText('Payment link created')).toBeVisible();
    });

    test('Should not allow clearing a required country dropdown', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();

        const billingCountry = page.getByTestId('form-field-billingAddress.country');
        await billingCountry.getByRole('combobox').click();
        await expect(billingCountry.getByRole('button', { name: 'Clear selection' })).toHaveCount(0);
    });
});
