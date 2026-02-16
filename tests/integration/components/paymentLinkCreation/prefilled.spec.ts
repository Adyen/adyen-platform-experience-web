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
        await expect(page.locator('input[name="linkValidity.quantity"]')).toHaveValue('3');
        await expect(page.locator('button[name="linkValidity.durationUnit"]')).toHaveAttribute('title', 'weeks');
        await expect(page.getByRole('button', { name: 'EUR' })).toBeVisible();
        await expect(page.locator('input[name="amount.value"]')).toHaveValue('123.45');
        await expect(page.locator('input[name="reference"]')).toHaveValue('SHP000001');
        await expect(page.locator('button[name="linkType"]')).toHaveAttribute('title', 'Open');
        await expect(page.locator('input[name="description"]')).toHaveValue('This is a test description');
        await expect(page.getByRole('button', { name: 'Tuesday, Dec 09, 2025' })).toBeVisible();

        await continueButton.click();

        // Step 3: Verify Customer Details are prefilled
        await expect(page.locator('input[name="shopperReference"]')).toHaveValue('test');
        await expect(page.locator('input[name="shopperName.firstName"]')).toHaveValue('John');
        await expect(page.locator('input[name="shopperName.lastName"]')).toHaveValue('Doe');
        await expect(page.locator('input[name="shopperEmail"]')).toHaveValue('test@example.com');
        await expect(page.getByTitle('ES (+34)')).toBeVisible();
        await expect(page.locator('input[name="telephoneNumber"]')).toHaveValue('3002119220');
        await expect(page.locator('div[name="countryCode"]')).toHaveAttribute('title', 'Spain');

        // Delivery address
        await expect(page.locator('input[name="deliveryAddress.street"]')).toHaveValue('Gran Via');
        await expect(page.locator('input[name="deliveryAddress.houseNumberOrName"]')).toHaveValue('123');
        await expect(page.locator('input[name="deliveryAddress.city"]')).toHaveValue('Madrid');
        await expect(page.locator('input[name="deliveryAddress.postalCode"]')).toHaveValue('28001');

        // Billing address
        await expect(page.locator('input[name="billingAddress.street"]')).toHaveValue('Calle 25 #34-12');
        await expect(page.locator('input[name="billingAddress.houseNumberOrName"]')).toHaveValue('1');
        await expect(page.locator('input[name="billingAddress.city"]')).toHaveValue('Medellin');
        await expect(page.locator('input[name="billingAddress.postalCode"]')).toHaveValue('05001');

        await expect(page.getByTitle('English')).toBeVisible();

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
