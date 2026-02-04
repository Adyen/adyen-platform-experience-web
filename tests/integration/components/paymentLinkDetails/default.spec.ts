import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--default';

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render details screen', async ({ page }) => {
        await expect(page.getByText('Payment link details')).toBeVisible();
        await expect(page.getByText('Active')).toBeVisible();
        await expect(page.getByText('150.00 USD')).toBeVisible();
        await expect(page.getByText('Expires on:')).toBeVisible();
        await expect(page.getByText('Link information')).toBeVisible();
        await expect(page.getByText('Shopper information')).toBeVisible();
        await expect(page.getByText('Activity')).toBeVisible();
        await expect(page.getByText('Payment link ID')).toBeVisible();
        await expect(page.getByText('PLTEST001')).toBeVisible();
        await expect(page.getByText('Store', { exact: true })).toBeVisible();
        await expect(page.getByText('STORE_NY_001')).toBeVisible();
        await expect(page.getByText('Merchant reference')).toBeVisible();
        await expect(page.getByText('REF-001')).toBeVisible();
        await expect(page.getByText('Created on')).toBeVisible();
        await expect(page.getByText('Expires on', { exact: true })).toBeVisible();
        await expect(page.getByText('Link type')).toBeVisible();
        await expect(page.getByText('Single use')).toBeVisible();
        await expect(getComponentRoot(page).getByText('Description')).toBeVisible();
        await expect(page.getByText('Payment for online order #001')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Expire now' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Copy payment link' })).toBeVisible();
    });

    test('should switch to link information tab when the latter is clicked', async ({ page }) => {
        await page.getByRole('tab', { name: 'Shopper information' }).click();
        await page.getByRole('tab', { name: 'Link information' }).click();
        await expect(page.getByText('Payment link ID')).toBeVisible();
    });

    test('should switch to shopper information tab when the latter is clicked', async ({ page }) => {
        await page.getByRole('tab', { name: 'Shopper information' }).click();
        await expect(page.getByText('Reference', { exact: true })).toBeVisible();
        await expect(page.getByText('CUST-001')).toBeVisible();
        await expect(page.getByText('Full name')).toBeVisible();
        await expect(page.getByText('John Doe')).toBeVisible();
        await expect(page.getByText('Email')).toBeVisible();
        await expect(page.getByText('john.doe@example.com')).toBeVisible();
        await expect(page.getByText('Phone')).toBeVisible();
        await expect(page.getByText('+1-555-123-4567')).toBeVisible();
        await expect(page.getByText('Country/Region')).toBeVisible();
        await expect(page.getByText('United States')).toHaveCount(2);
        await expect(page.getByText('Billing address')).toBeVisible();
        await expect(page.getByText('Shipping address')).toBeVisible();
        await expect(page.getByText('Street')).toHaveCount(2);
        await expect(page.getByText('Champs-Élysées')).toBeVisible();
        await expect(page.getByText('5th Avenue')).toBeVisible();
        await expect(page.getByText('House number')).toHaveCount(2);
        await expect(page.getByText('45', { exact: true })).toBeVisible();
        await expect(page.getByText('123', { exact: true })).toBeVisible();
        await expect(page.getByText('Country', { exact: true })).toHaveCount(2);
        await expect(page.getByText('France')).toBeVisible();
        await expect(page.getByText('City')).toHaveCount(2);
        await expect(page.getByText('Paris')).toBeVisible();
        await expect(page.getByText('New York')).toBeVisible();
        await expect(page.getByText('Postal code')).toHaveCount(2);
        await expect(page.getByText('75001')).toBeVisible();
        await expect(page.getByText('10001')).toBeVisible();
    });

    test('should switch to activity tab when the latter is clicked', async ({ page }) => {
        await page.getByRole('tab', { name: 'Activity' }).click();
        await expect(page.getByText('Payment link created')).toBeVisible();
    });

    test('should render expiration screen when expiration button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Expire now' }).click();
        await expect(page.getByText('Expire this link')).toBeVisible();
        await expect(
            page.getByText(
                "Deactivating this link will immediately prevent your shopper from making new payments. You'll need to create a new payment link or reissue the deactivated one for the shopper to pay."
            )
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Expire link' })).toBeVisible();
    });

    test('should render details screen when back navigation button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Expire now' }).click();
        await page.getByRole('button', { name: 'Go back' }).click();
        await expect(page.getByText('Payment link details')).toBeVisible();
    });

    test('should render expiration confirmation screen when expiration confirmation button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Expire now' }).click();
        await page.getByRole('button', { name: 'Expire link' }).click();
        await expect(page.getByText('Link has been deactivated')).toBeVisible();
        await expect(page.getByText('The payment link is now expired and cannot be used by the shopper.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Show details' })).toBeVisible();
    });

    test('should render details screen when details button in expiration confirmation screen is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Expire now' }).click();
        await page.getByRole('button', { name: 'Expire link' }).click();
        await page.getByRole('button', { name: 'Show details' }).click();
        await expect(page.getByText('Payment link details')).toBeVisible();
        await expect(page.getByText('Expired', { exact: true })).toBeVisible();
    });
});
