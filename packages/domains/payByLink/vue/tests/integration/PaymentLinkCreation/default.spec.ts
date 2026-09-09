import { test, expect, type Page } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';
const getFieldError = (page: Page, name: string) => page.getByTestId(`form-field-${name}`).locator('[aria-live="polite"]');

test.describe('Payment link creation - Link creation success', () => {
    test('Should successfully create a payment link after filling out all form fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Step 1: Store Selection
        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 2: Payment Details
        // Set validity to Custom 30 hours
        await page.getByRole('combobox', { name: 'Validity' }).click();
        await page.getByRole('option', { name: 'Custom' }).click();
        await page.getByTestId('form-field-linkValidity.quantity').getByRole('spinbutton').fill('30');
        await page.getByTestId('form-field-linkValidity.quantity').getByRole('combobox').click();
        await page.getByRole('option', { name: 'hours' }).click();

        // Set amount to CNY 3000
        await page.getByRole('combobox', { name: 'Amount currency' }).click();
        await page.getByRole('option', { name: 'CNY' }).click();
        await page.getByTestId('form-field-amount.value').getByRole('spinbutton').fill('3000');

        // Fill merchant reference
        await page.getByTestId('form-field-reference').getByRole('textbox').fill('MERCH00001');

        // Select link type Open
        await page.getByRole('combobox', { name: 'Link type' }).click();
        await page.getByRole('option', { name: 'Open' }).click();

        // Fill description
        await page.getByTestId('form-field-description').getByRole('textbox').fill('This is a test description');

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Customer Details
        // Shopper reference
        await page.getByTestId('form-field-shopperReference').getByRole('textbox').fill('SHP000001');

        // Shopper name
        await page.getByTestId('form-field-shopperName.firstName').getByRole('textbox').fill('John');
        await page.getByTestId('form-field-shopperName.lastName').getByRole('textbox').fill('Doe');

        // Shopper email
        await page.getByTestId('form-field-shopperEmail').getByRole('textbox').fill('john.doe@adyen.com');

        // Phone number with country code
        await page.getByTestId('form-field-telephoneNumber').getByRole('combobox').click();
        await page.getByRole('combobox', { name: 'Phone prefix' }).fill('co');
        await page.getByRole('option', { name: 'CO (+57)' }).click();
        await page.getByTestId('form-field-telephoneNumber').getByRole('textbox').fill('3002119220');

        // Country/Region
        await page.getByTestId('form-field-countryCode').getByRole('combobox').click();
        await page.getByRole('combobox', { name: 'Country/Region' }).fill('united');
        await page.getByRole('option', { name: 'United States' }).click();

        // Billing address
        await page.getByTestId('form-field-billingAddress.street').getByRole('textbox').fill('Imaginary Street');
        await page.getByTestId('form-field-billingAddress.houseNumberOrName').getByRole('textbox').fill('100');
        await page.getByTestId('form-field-billingAddress.country').getByRole('combobox').click();
        await page.getByRole('option', { name: 'Mexico' }).click();
        await page.getByTestId('form-field-billingAddress.city').getByRole('textbox').fill('Monterrey');
        await page.getByTestId('form-field-billingAddress.postalCode').getByRole('textbox').fill('050010');

        // Enable separate delivery address
        await page.getByText('Shipping and billing addresses are the same').click();

        // Delivery address
        await page.getByTestId('form-field-deliveryAddress.street').getByRole('textbox').fill('Test Street');
        await page.getByTestId('form-field-deliveryAddress.houseNumberOrName').getByRole('textbox').fill('123');
        await page.getByTestId('form-field-deliveryAddress.country').getByRole('combobox').click();
        await page.getByRole('option', { name: 'United States', exact: true }).click();
        await page.getByTestId('form-field-deliveryAddress.city').getByRole('textbox').fill('Gaithersburg');
        await page.getByTestId('form-field-deliveryAddress.postalCode').getByRole('textbox').fill('20878');

        // Language
        await page.getByTestId('form-field-shopperLocale').getByRole('combobox').click();
        await page.getByRole('combobox', { name: 'Language' }).fill('spa');
        await page.getByRole('option', { name: 'Español' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 4: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        // Submit the form
        const createPaymentLinkRequest = page.waitForRequest(
            request => request.method() === 'POST' && request.url().includes('/paybylink/paymentLinks')
        );
        await page.getByRole('button', { name: 'Create payment link' }).click();
        const request = await createPaymentLinkRequest;
        expect(request.postDataJSON()).toMatchObject({
            amount: {
                currency: 'CNY',
                value: 300000,
            },
        });

        // Verify success
        await expect(page.getByText('Payment link created')).toBeVisible();
        await expect(page.getByText('Copy the unique link below', { exact: false })).toBeVisible();

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
        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 2: Payment Details
        await page.getByRole('button', { name: 'Continue' }).click();

        const amountField = page.getByTestId('form-field-amount.value').getByRole('spinbutton');
        await expect(getFieldError(page, 'amount.value')).toContainText('Please select a currency');

        await page.getByRole('combobox', { name: 'Amount currency' }).click();
        await page.getByRole('option', { name: 'CNY' }).click();
        await expect(getFieldError(page, 'amount.value')).toContainText('This field is required');

        const referenceField = page.getByTestId('form-field-reference').getByRole('textbox');
        await expect(getFieldError(page, 'reference')).toContainText('This field is required');
        await expect(referenceField).toHaveAttribute('aria-invalid', 'true');

        const linkTypeField = page.getByTestId('form-field-linkType').getByRole('combobox');
        await expect(getFieldError(page, 'linkType')).toContainText('This field is required');

        const descriptionField = page.getByTestId('form-field-description').getByRole('textbox');
        await expect(getFieldError(page, 'description')).toContainText('This field is required');

        await amountField.fill('100000000000001');
        await expect(amountField).toHaveValue('10000000000000');
        await amountField.press('1');
        await expect(amountField).toHaveValue('10000000000000');
        await referenceField.fill('MERCH00001');
        await linkTypeField.click();
        await page.getByRole('option', { name: 'Open' }).click();
        await descriptionField.fill('This is a test description');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Customer Details
        await page.getByRole('button', { name: 'Continue' }).click();

        const shopperReferenceField = page.getByTestId('form-field-shopperReference').getByRole('textbox');
        await expect(getFieldError(page, 'shopperReference')).toContainText('This field is required');

        const shopperPhoneField = page.getByTestId('form-field-telephoneNumber').getByRole('textbox');
        await expect(getFieldError(page, 'telephoneNumber')).toContainText('This field is required');

        const countryField = page.getByTestId('form-field-countryCode').getByRole('combobox');
        await expect(getFieldError(page, 'countryCode')).toContainText('This field is required');

        const languageField = page.getByTestId('form-field-shopperLocale').getByRole('combobox');
        await expect(getFieldError(page, 'shopperLocale')).toContainText('This field is required');

        const billingStreetField = page.getByTestId('form-field-billingAddress.street').getByRole('textbox');
        await expect(getFieldError(page, 'billingAddress.street')).toContainText('This field is required');

        const billingHouseNumberField = page.getByTestId('form-field-billingAddress.houseNumberOrName').getByRole('textbox');
        await expect(getFieldError(page, 'billingAddress.houseNumberOrName')).toContainText('This field is required');

        const billingCountryField = page.getByTestId('form-field-billingAddress.country').getByRole('combobox');
        await expect(getFieldError(page, 'billingAddress.country')).toContainText('This field is required');

        const billingCityField = page.getByTestId('form-field-billingAddress.city').getByRole('textbox');
        await expect(getFieldError(page, 'billingAddress.city')).toContainText('This field is required');

        const billingPostalCodeField = page.getByTestId('form-field-billingAddress.postalCode').getByRole('textbox');
        await expect(getFieldError(page, 'billingAddress.postalCode')).toContainText('This field is required');

        await shopperReferenceField.fill('SHP000001');
        await page.getByTestId('form-field-shopperEmail').getByRole('textbox').fill('john.doe@adyen.com');
        await shopperPhoneField.fill('3002119220');

        await countryField.click();
        await page.getByRole('combobox', { name: 'Country/Region' }).fill('united');
        await page.getByRole('option', { name: 'United States' }).click();

        // Billing address
        await billingStreetField.fill('Imaginary Street');
        await billingHouseNumberField.fill('100');
        await billingCountryField.click();
        await page.getByRole('option', { name: 'Mexico' }).click();
        await billingCityField.fill('Monterrey');
        await billingPostalCodeField.fill('050010');

        await languageField.click();
        await page.getByRole('combobox', { name: 'Language' }).fill('spa');
        await page.getByRole('option', { name: 'Español' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(getFieldError(page, 'telephoneNumber')).toContainText('You must select a phone prefix');

        await page.getByTestId('form-field-telephoneNumber').getByRole('combobox').click();
        await page.getByRole('combobox', { name: 'Phone prefix' }).fill('co');
        await page.getByRole('option', { name: 'CO (+57)' }).click();
        await expect(page.getByRole('listbox')).toBeHidden();
        await shopperPhoneField.fill('');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(getFieldError(page, 'telephoneNumber')).toContainText('You must enter a phone number');

        await shopperPhoneField.fill('3002119220');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 4: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByText('Shopper information')).toBeVisible();
    });
});
