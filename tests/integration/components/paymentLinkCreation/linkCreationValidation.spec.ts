import { test, expect, Locator } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';

test.describe('Payment link creation - Link creation validation', () => {
    test('Should validate all required form fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        const getFieldErrorMessage = (field: Locator) =>
            field
                .locator('xpath=ancestor::div[contains(@class,"adyen-pe-payment-link-creation-form__field-container")]')
                .first()
                .locator('.adyen-pe-field-error__message');

        // Step 1: Store Selection
        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 2: Payment Details
        await page.getByRole('button', { name: 'Continue' }).click();

        const amountField = page.locator('input[name="amount.value"]');
        const amountErrorMessage = getFieldErrorMessage(amountField);
        await expect(amountErrorMessage).toHaveText('Please select a currency');

        await page.locator('button[title="Select option"]').first().click();
        await page.getByRole('option', { name: 'CNY' }).click();
        await expect(amountErrorMessage).toHaveText('This field is required');

        const referenceField = page.locator('input[name="reference"]');
        await expect(getFieldErrorMessage(referenceField)).toHaveText('This field is required');

        const linkTypeField = page.locator('button[name="linkType"], div[name="linkType"]').first();
        await expect(getFieldErrorMessage(linkTypeField)).toHaveText('This field is required');

        const descriptionField = page.locator('input[name="description"]');
        await expect(getFieldErrorMessage(descriptionField)).toHaveText('This field is required');

        await amountField.fill('8403218043128031280312803218031283021');
        await expect(amountField).toHaveValue('10000000000000');
        await referenceField.fill('MERCH00001');
        await linkTypeField.click();
        await page.getByRole('option', { name: 'Open' }).click();
        await descriptionField.fill('This is a test description');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Customer Details
        await page.getByRole('button', { name: 'Continue' }).click();

        const shopperReferenceField = page.locator('input[name="shopperReference"]');
        await expect(getFieldErrorMessage(shopperReferenceField)).toHaveText('This field is required');

        const shopperPhoneField = page.locator('input[name="telephoneNumber"]');
        await expect(getFieldErrorMessage(shopperPhoneField)).toHaveText('This field is required');

        const countryField = page.locator('div[name="countryCode"], button[name="countryCode"]').first();
        await expect(getFieldErrorMessage(countryField)).toHaveText('This field is required');

        const languageField = page.locator('div[name="shopperLocale"], button[name="shopperLocale"]').first();
        await expect(getFieldErrorMessage(languageField)).toHaveText('This field is required');

        const billingStreetField = page.locator('input[name="billingAddress.street"]');
        await expect(getFieldErrorMessage(billingStreetField)).toHaveText('This field is required');

        const billingHouseNumberField = page.locator('input[name="billingAddress.houseNumberOrName"]');
        await expect(getFieldErrorMessage(billingHouseNumberField)).toHaveText('This field is required');

        const billingCountryField = page.locator('div[name="billingAddress.country"], button[name="billingAddress.country"]').first();
        await expect(getFieldErrorMessage(billingCountryField)).toHaveText('This field is required');

        const billingCityField = page.locator('input[name="billingAddress.city"]');
        await expect(getFieldErrorMessage(billingCityField)).toHaveText('This field is required');

        const billingPostalCodeField = page.locator('input[name="billingAddress.postalCode"]');
        await expect(getFieldErrorMessage(billingPostalCodeField)).toHaveText('This field is required');

        await shopperReferenceField.fill('SHP000001');
        await page.locator('input[name="shopperEmail"]').fill('john.doe@adyen.com');

        const phoneFieldContainer = shopperPhoneField
            .locator('xpath=ancestor::div[contains(@class,"adyen-pe-payment-link-creation-form__field-container")]')
            .first();
        await phoneFieldContainer.locator('[title="Select option"]').first().click();
        await page.getByRole('combobox', { name: 'Select option' }).first().fill('co');
        await page.getByRole('option', { name: 'CO (+57)' }).click();
        await expect(phoneFieldContainer.locator('.adyen-pe-dropdown__button--active')).toHaveCount(0);
        await shopperPhoneField.fill('3002119220');

        await countryField.click();
        await page.getByRole('combobox', { name: 'Select option' }).first().fill('united');
        await page.getByRole('option', { name: 'United States' }).first().click();

        // Billing address
        await page.locator('input[name="billingAddress.street"]').fill('Imaginary Street');
        await page.locator('input[name="billingAddress.houseNumberOrName"]').fill('100');
        await page.locator('div[name="billingAddress.country"]').click();
        await page.getByRole('option', { name: 'Mexico' }).click();
        await page.locator('input[name="billingAddress.city"]').fill('Monterrey');
        await page.locator('input[name="billingAddress.postalCode"]').fill('050010');

        await languageField.click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('spa');
        await page.getByRole('option', { name: 'Español' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 4: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByText('Shopper information')).toBeVisible();
    });
});
