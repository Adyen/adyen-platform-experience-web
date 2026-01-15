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
        await page
            .locator('div')
            .filter({ hasText: /^Custom$/ })
            .click();
        await page.locator('input[name="linkValidity.quantity"]').click();
        await page.locator('input[name="linkValidity.quantity"]').fill('30');

        await page.locator('button[name="linkValidity.durationUnit"]').click();
        await page.getByRole('option', { name: 'hours' }).click();

        // Set amount to CNY 3000
        await page.locator('button[title="Select option"]').first().click();
        await page.getByRole('option', { name: 'CNY' }).click();
        await page.locator('input[name="amount.value"]').fill('3000');

        // Fill merchant reference
        await page.locator('input[name="reference"]').click();
        await page.locator('input[name="reference"]').fill('MERCH00001');

        // Select link type Open
        await page.getByTitle('Select option').click();
        await page.getByRole('option', { name: 'Open' }).click();

        // Fill description
        await page.locator('input[name="description"]').click();
        await page.locator('input[name="description"]').fill('This is a test description');

        // Select delivery date
        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByText('1', { exact: true }).click();

        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Customer Details
        // Shopper reference
        await page.locator('input[name="shopperReference"]').click();
        await page.locator('input[name="shopperReference"]').fill('SHP000001');

        // Shopper name
        await page.locator('input[name="shopperName.firstName"]').click();
        await page.locator('input[name="shopperName.firstName"]').fill('John');
        await page.locator('input[name="shopperName.lastName"]').click();
        await page.locator('input[name="shopperName.lastName"]').fill('Doe');

        // Shopper email
        await page.locator('input[name="shopperEmail"]').click();
        await page.locator('input[name="shopperEmail"]').fill('john.doe@adyen.com');

        // Phone number with country code
        await page.getByTitle('Select option').first().click();
        await page.getByRole('combobox', { name: 'Select option' }).first().fill('co');
        await page.getByRole('option', { name: 'CO (+57)' }).click();
        await page.locator('input[name="telephoneNumber"]').click();
        await page.locator('input[name="telephoneNumber"]').fill('3002119220');

        // Country/Region
        await page.locator('div[name="countryCode"]').click();
        await page.getByRole('combobox', { name: 'Select option' }).first().fill('united');
        await page.getByRole('option', { name: 'United States' }).first().click();

        // Delivery address
        await page.locator('input[name="deliveryAddress.street"]').fill('Test Street');
        await page.locator('input[name="deliveryAddress.houseNumberOrName"]').fill('123');
        await page.locator('div[name="deliveryAddress.country"]').click();
        await page
            .getByLabel('', { exact: true })
            .getByRole('option')
            .filter({ hasText: /^United States$/ })
            .click();
        await page.locator('input[name="deliveryAddress.city"]').fill('Gaithersburg');
        await page.locator('input[name="deliveryAddress.postalCode"]').fill('20878');

        // Enable separate billing address
        await page.getByText('Billing and shipping are').click();

        // Billing address
        await page.locator('input[name="billingAddress.street"]').fill('Imaginary Street');
        await page.locator('input[name="billingAddress.houseNumberOrName"]').fill('100');
        await page.locator('div[name="billingAddress.country"]').click();
        await page.getByRole('option', { name: 'Mexico' }).click();
        await page.locator('input[name="billingAddress.city"]').fill('Monterrey');
        await page.locator('input[name="billingAddress.postalCode"]').fill('050010');

        // Language
        await page.getByTitle('Select option').click();
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
