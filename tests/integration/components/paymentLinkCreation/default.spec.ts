import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';

test.describe('Payment link creation - Link creation success', () => {
    test('Should successfully create a payment link after filling out all form fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Step 1: Store Selection
        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 2: Payment Details
        // Set validity to Custom 30 hours
        await page.getByRole('button', { name: '24 hours' }).click();
        await page.getByRole('option', { name: 'Custom' }).click();
        await page.getByTestId('form-field-linkValidity.quantity').getByRole('spinbutton').click();
        await page.getByTestId('form-field-linkValidity.quantity').getByRole('spinbutton').fill('30');

        await page.getByTestId('form-field-linkValidity.quantity').getByRole('button', { name: 'Select option', exact: true }).click();
        await page.getByRole('option', { name: 'hours' }).click();

        // Set amount to CNY 3000
        await page.getByTestId('form-field-amount.value').getByRole('button', { name: 'Select option', exact: true }).click();
        await page.getByRole('option', { name: 'CNY' }).click();
        await page.getByTestId('form-field-amount.value').getByRole('spinbutton').fill('3000');

        // Fill merchant reference
        await page.getByTestId('form-field-reference').getByRole('textbox').click();
        await page.getByTestId('form-field-reference').getByRole('textbox').fill('MERCH00001');

        // Select link type Open
        await page.getByTestId('form-field-linkType').getByRole('button', { name: 'Select option', exact: true }).click();
        await page.getByRole('option', { name: 'Open' }).click();

        // Fill description
        await page.getByTestId('form-field-description').getByRole('textbox').click();
        await page.getByTestId('form-field-description').getByRole('textbox').fill('This is a test description');

        // Select delivery date
        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByText('1', { exact: true }).click();

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Customer Details
        // Shopper reference
        await page.getByTestId('form-field-shopperReference').getByRole('textbox').click();
        await page.getByTestId('form-field-shopperReference').getByRole('textbox').fill('SHP000001');

        // Shopper name
        await page.getByTestId('form-field-shopperName.firstName').getByRole('textbox').click();
        await page.getByTestId('form-field-shopperName.firstName').getByRole('textbox').fill('John');
        await page.getByTestId('form-field-shopperName.lastName').getByRole('textbox').click();
        await page.getByTestId('form-field-shopperName.lastName').getByRole('textbox').fill('Doe');

        // Shopper email
        await page.getByTestId('form-field-shopperEmail').getByRole('textbox').click();
        await page.getByTestId('form-field-shopperEmail').getByRole('textbox').fill('john.doe@adyen.com');

        // Phone number with country code
        await page.getByTestId('form-field-telephoneNumber').getByTitle('Select option', { exact: true }).click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('co');
        await page.getByRole('option', { name: 'CO (+57)' }).click();
        await page.getByTestId('form-field-telephoneNumber').getByRole('textbox').click();
        await page.getByTestId('form-field-telephoneNumber').getByRole('textbox').fill('3002119220');

        // Country/Region
        await page.getByTestId('form-field-countryCode').getByTitle('Select option', { exact: true }).click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('united');
        await page.getByRole('option', { name: 'United States' }).click();

        // Billing address
        await page.getByTestId('form-field-billingAddress.street').getByRole('textbox').fill('Imaginary Street');
        await page.getByTestId('form-field-billingAddress.houseNumberOrName').getByRole('textbox').fill('100');
        await page.getByTestId('form-field-billingAddress.country').getByTitle('Select option', { exact: true }).click();
        await page.getByRole('option', { name: 'Mexico' }).click();
        await page.getByTestId('form-field-billingAddress.city').getByRole('textbox').fill('Monterrey');
        await page.getByTestId('form-field-billingAddress.postalCode').getByRole('textbox').fill('050010');

        // Enable separate billing address
        await page.getByText('Shipping and billing addresses are the same').click();

        // Delivery address
        await page.getByTestId('form-field-deliveryAddress.street').getByRole('textbox').fill('Test Street');
        await page.getByTestId('form-field-deliveryAddress.houseNumberOrName').getByRole('textbox').fill('123');
        await page.getByTestId('form-field-deliveryAddress.country').getByTitle('Select option', { exact: true }).click();
        await page.getByRole('option', { name: 'United States', exact: true }).click();
        await page.getByTestId('form-field-deliveryAddress.city').getByRole('textbox').fill('Gaithersburg');
        await page.getByTestId('form-field-deliveryAddress.postalCode').getByRole('textbox').fill('20878');

        // Language
        await page.getByTestId('form-field-shopperLocale').getByTitle('Select option', { exact: true }).click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('spa');
        await page.getByRole('option', { name: 'Español' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 4: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        // Submit the form
        await page.getByRole('button', { name: 'Create payment link' }).click();

        // Verify success
        await expect(page.getByText('Payment link created')).toBeVisible();
        await expect(page.getByText('Copy the unique link below')).toBeVisible();

        // Test copy button
        await page.getByRole('button', { name: 'Copy payment link' }).click();
        await expect(page.getByRole('button', { name: 'Copied to clipboard' })).toBeVisible();

        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBe('http://pay.adyen/links/12345');

        // Verify show details button is present
        await expect(page.getByRole('button', { name: 'Show details' })).toBeVisible();
    });
});

test.describe('Payment link creation - Link creation validation', () => {
    test('Should validate all required form fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Step 1: Store Selection
        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 2: Payment Details
        await page.getByRole('button', { name: 'Continue' }).click();

        const amountField = page.getByTestId('form-field-amount.value').getByRole('spinbutton');
        const amountErrorMessage = page.getByTestId('field-error-amount.value');
        await expect(amountErrorMessage).toHaveText('Please select a currency');

        await page.getByTestId('form-field-amount.value').getByRole('button', { name: 'Select option', exact: true }).click();
        await page.getByRole('option', { name: 'CNY' }).click();
        await expect(amountErrorMessage).toHaveText('This field is required');

        const referenceField = page.getByTestId('form-field-reference').getByRole('textbox');
        await expect(page.getByTestId('field-error-reference')).toHaveText('This field is required');

        const linkTypeField = page.getByTestId('form-field-linkType').getByRole('button', { name: 'Select option', exact: true });
        await expect(page.getByTestId('field-error-linkType')).toHaveText('This field is required');

        const descriptionField = page.getByTestId('form-field-description').getByRole('textbox');
        await expect(page.getByTestId('field-error-description')).toHaveText('This field is required');

        await amountField.fill('8403218043128031280312803218031283021');
        await expect(amountField).toHaveValue('10000000000000');
        await referenceField.fill('MERCH00001');
        await linkTypeField.click();
        await page.getByRole('option', { name: 'Open' }).click();
        await descriptionField.fill('This is a test description');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Customer Details
        await page.getByRole('button', { name: 'Continue' }).click();

        const shopperReferenceField = page.getByTestId('form-field-shopperReference').getByRole('textbox');
        await expect(page.getByTestId('field-error-shopperReference')).toHaveText('This field is required');

        const shopperPhoneField = page.getByTestId('form-field-telephoneNumber').getByRole('textbox');
        await expect(page.getByTestId('field-error-telephoneNumber')).toHaveText('This field is required');

        const countryField = page.getByTestId('form-field-countryCode').getByTitle('Select option', { exact: true });
        await expect(page.getByTestId('field-error-countryCode')).toHaveText('This field is required');

        const languageField = page.getByTestId('form-field-shopperLocale').getByTitle('Select option', { exact: true });
        await expect(page.getByTestId('field-error-shopperLocale')).toHaveText('This field is required');

        const billingStreetField = page.getByTestId('form-field-billingAddress.street').getByRole('textbox');
        await expect(page.getByTestId('field-error-billingAddress.street')).toHaveText('This field is required');

        const billingHouseNumberField = page.getByTestId('form-field-billingAddress.houseNumberOrName').getByRole('textbox');
        await expect(page.getByTestId('field-error-billingAddress.houseNumberOrName')).toHaveText('This field is required');

        const billingCountryField = page.getByTestId('form-field-billingAddress.country').getByTitle('Select option', { exact: true });
        await expect(page.getByTestId('field-error-billingAddress.country')).toHaveText('This field is required');

        const billingCityField = page.getByTestId('form-field-billingAddress.city').getByRole('textbox');
        await expect(page.getByTestId('field-error-billingAddress.city')).toHaveText('This field is required');

        const billingPostalCodeField = page.getByTestId('form-field-billingAddress.postalCode').getByRole('textbox');
        await expect(page.getByTestId('field-error-billingAddress.postalCode')).toHaveText('This field is required');

        await shopperReferenceField.fill('SHP000001');
        await page.getByTestId('form-field-shopperEmail').getByRole('textbox').fill('john.doe@adyen.com');

        await page.getByTestId('form-field-telephoneNumber').getByTitle('Select option', { exact: true }).click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('co');
        await page.getByRole('option', { name: 'CO (+57)' }).click();
        await expect(page.getByRole('listbox')).toBeHidden();
        await shopperPhoneField.fill('3002119220');

        await countryField.click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('united');
        await page.getByRole('option', { name: 'United States' }).click();

        // Billing address
        await billingStreetField.fill('Imaginary Street');
        await billingHouseNumberField.fill('100');
        await billingCountryField.click();
        await page.getByRole('option', { name: 'Mexico' }).click();
        await billingCityField.fill('Monterrey');
        await billingPostalCodeField.fill('050010');

        await languageField.click();
        await page.getByRole('combobox', { name: 'Select option' }).fill('spa');
        await page.getByRole('option', { name: 'Español' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 4: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByText('Shopper information')).toBeVisible();
    });
});
