import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--prefilled';

test.describe('Payment link creation - Link creation success', () => {
    test('Should successfully create a payment link without changing any prefilled fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const continueButton = page.getByRole('button', { name: 'Continue' });
        const createPaymentLinkButton = page.getByRole('button', { name: 'Create payment link' });

        // Step 2: Verify Payment Details are prefilled
        await expect(page.getByRole('button', { name: 'Custom', exact: true })).toBeVisible();
        await expect(page.getByTestId('form-field-linkValidity.quantity').getByRole('spinbutton')).toHaveValue('3');
        await expect(page.getByTestId('form-field-linkValidity.quantity').getByText('weeks', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'EUR' })).toBeVisible();
        await expect(page.getByTestId('form-field-amount.value').getByRole('spinbutton')).toHaveValue('123.45');
        await expect(page.getByTestId('form-field-reference').getByRole('textbox')).toHaveValue('SHP000001');
        await expect(page.getByTestId('form-field-linkType').getByText('Open', { exact: true })).toBeVisible();
        await expect(page.getByTestId('form-field-description').getByRole('textbox')).toHaveValue('This is a test description');
        await expect(page.getByRole('button', { name: 'Tuesday, Dec 09, 2025' })).toBeVisible();

        await continueButton.click();

        // Step 3: Verify Customer Details are prefilled
        await expect(page.getByTestId('form-field-shopperReference').getByRole('textbox')).toHaveValue('test');
        await expect(page.getByTestId('form-field-shopperName.firstName').getByRole('textbox')).toHaveValue('John');
        await expect(page.getByTestId('form-field-shopperName.lastName').getByRole('textbox')).toHaveValue('Doe');
        await expect(page.getByTestId('form-field-shopperEmail').getByRole('textbox')).toHaveValue('test@example.com');
        await expect(page.getByTestId('form-field-telephoneNumber').getByText('ES (+34)', { exact: true })).toBeVisible();
        await expect(page.getByTestId('form-field-telephoneNumber').getByRole('textbox')).toHaveValue('3002119220');
        await expect(page.getByTestId('form-field-countryCode').getByText('Spain', { exact: true })).toBeVisible();

        // Delivery address
        await expect(page.getByTestId('form-field-deliveryAddress.street').getByRole('textbox')).toHaveValue('Gran Via');
        await expect(page.getByTestId('form-field-deliveryAddress.houseNumberOrName').getByRole('textbox')).toHaveValue('123');
        await expect(page.getByTestId('form-field-deliveryAddress.city').getByRole('textbox')).toHaveValue('Madrid');
        await expect(page.getByTestId('form-field-deliveryAddress.postalCode').getByRole('textbox')).toHaveValue('28001');

        // Billing address
        await expect(page.getByTestId('form-field-billingAddress.street').getByRole('textbox')).toHaveValue('Calle 25 #34-12');
        await expect(page.getByTestId('form-field-billingAddress.houseNumberOrName').getByRole('textbox')).toHaveValue('1');
        await expect(page.getByTestId('form-field-billingAddress.city').getByRole('textbox')).toHaveValue('Medellin');
        await expect(page.getByTestId('form-field-billingAddress.postalCode').getByRole('textbox')).toHaveValue('05001');

        await expect(page.getByTestId('form-field-shopperLocale').getByText('English', { exact: true })).toBeVisible();

        await continueButton.click();

        await expect(createPaymentLinkButton).toBeVisible();

        // Step 4: Summary
        await expect(page.getByText('Payment details')).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        // Submit the form
        await page.getByRole('button', { name: 'Create payment link' }).click();

        // Verify success
        await expect(page.getByText('Payment link created')).toBeVisible();
        await expect(page.getByText('Copy the unique link below')).toBeVisible();
    });
});
