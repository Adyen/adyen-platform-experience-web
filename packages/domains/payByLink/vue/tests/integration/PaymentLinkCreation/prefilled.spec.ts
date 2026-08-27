import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--prefilled';

test.describe('Payment link creation - Link creation success', () => {
    test('Should successfully create a payment link without changing any prefilled fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const continueButton = page.getByRole('button', { name: 'Continue' });
        const createPaymentLinkButton = page.getByRole('button', { name: 'Create payment link' });

        // Step 1: Verify Payment Details are prefilled (single store setup skips store selection)
        await expect(page.getByRole('combobox', { name: 'Validity' })).toHaveText('Custom');
        await expect(page.getByTestId('form-field-linkValidity.quantity').getByRole('spinbutton')).toHaveValue('3');
        await expect(page.getByTestId('form-field-linkValidity.quantity').getByRole('combobox')).toHaveText('weeks');
        await expect(page.getByRole('combobox', { name: 'Amount currency' })).toHaveText('EUR');
        await expect(page.getByTestId('form-field-amount.value').getByRole('spinbutton')).toHaveValue('123.45');
        await expect(page.getByTestId('form-field-reference').getByRole('textbox')).toHaveValue('SHP000001');
        await expect(page.getByRole('combobox', { name: 'Link type' })).toHaveText('Open');
        await expect(page.getByTestId('form-field-description').getByRole('textbox')).toHaveValue('This is a test description');
        await expect(page.getByRole('combobox', { name: 'Delivery date' })).toHaveValue('Dec 9, 2025');

        await continueButton.click();

        // Step 2: Verify Customer Details are prefilled
        await expect(page.getByTestId('form-field-shopperReference').getByRole('textbox')).toHaveValue('test');
        await expect(page.getByTestId('form-field-shopperName.firstName').getByRole('textbox')).toHaveValue('John');
        await expect(page.getByTestId('form-field-shopperName.lastName').getByRole('textbox')).toHaveValue('Doe');
        await expect(page.getByTestId('form-field-shopperEmail').getByRole('textbox')).toHaveValue('test@example.com');
        await expect(page.getByRole('combobox', { name: 'Phone prefix' })).toHaveText('ES (+34)');
        await expect(page.getByRole('textbox', { name: 'Shopper phone' })).toHaveValue('3002119220');
        await expect(page.getByRole('combobox', { name: 'Country/Region' })).toHaveText('Spain');

        // Billing address (shown first, prefilled from the Colombian billing data)
        await expect(page.getByTestId('form-field-billingAddress.street').getByRole('textbox')).toHaveValue('Calle 25 #34-12');
        await expect(page.getByTestId('form-field-billingAddress.houseNumberOrName').getByRole('textbox')).toHaveValue('1');
        await expect(page.getByTestId('form-field-billingAddress.city').getByRole('textbox')).toHaveValue('Medellin');
        await expect(page.getByTestId('form-field-billingAddress.postalCode').getByRole('textbox')).toHaveValue('05001');

        // Delivery address (shown after unchecking "same address", prefilled from the Spanish delivery data)
        await expect(page.getByTestId('form-field-deliveryAddress.street').getByRole('textbox')).toHaveValue('Gran Via');
        await expect(page.getByTestId('form-field-deliveryAddress.houseNumberOrName').getByRole('textbox')).toHaveValue('123');
        await expect(page.getByTestId('form-field-deliveryAddress.city').getByRole('textbox')).toHaveValue('Madrid');
        await expect(page.getByTestId('form-field-deliveryAddress.postalCode').getByRole('textbox')).toHaveValue('28001');

        await expect(page.getByTestId('form-field-shopperLocale').getByRole('combobox')).toHaveText('en-US');

        await continueButton.click();

        await expect(createPaymentLinkButton).toBeVisible();

        // Step 3: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        // Submit the form
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        await createPaymentLinkButton.click();

        // Verify success
        await expect(page.getByText('Payment link created')).toBeVisible();
        await expect(page.getByText('Copy the unique link below', { exact: false })).toBeVisible();
    });
});
