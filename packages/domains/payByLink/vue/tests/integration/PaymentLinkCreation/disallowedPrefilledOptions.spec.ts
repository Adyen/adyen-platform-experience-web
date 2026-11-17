import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--disallowed-prefilled-options';

test.beforeEach(async ({ page }) => {
    await setTime(page);
    await goToStory(page, { id: STORY_ID });
});

test.describe('Payment link creation - Disallowed prefilled options', () => {
    test('Should discard prefilled dropdown values that are not among the available options', async ({ page }) => {
        const currency = page.getByRole('combobox', { name: 'Amount currency' });
        await Promise.all([
            expect(page.getByRole('combobox', { name: 'Validity' })).toHaveText('24 hours'),
            expect(currency).toHaveText('Select option'),
            expect(page.getByRole('combobox', { name: 'Link type' })).toHaveText('Single use'),
        ]);

        await currency.click();
        await page.getByRole('option', { name: 'GBP' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        await Promise.all([
            expect(page.getByRole('combobox', { name: 'Country/Region' })).toHaveText('Select option'),
            expect(page.getByRole('combobox', { name: 'Language' })).toHaveText('Language'),
            expect(page.getByTestId('form-field-billingAddress.country').getByRole('combobox')).toHaveText('Mexico'),
            expect(page.getByTestId('form-field-deliveryAddress.country')).toBeHidden(),
        ]);
        await page.getByRole('button', { name: 'Continue' }).click();

        const requestPromise = page.waitForRequest(request => request.method() === 'POST' && request.url().includes('/paybylink/paymentLinks'));
        await page.getByRole('button', { name: 'Create payment link' }).click();
        const payload = (await requestPromise).postDataJSON();
        expect(payload).toMatchObject({
            amount: { currency: 'GBP', value: 12345 },
            linkType: 'singleUse',
            linkValidity: { quantity: 24, durationUnit: 'hour' },
            billingAddress: { country: 'MX' },
            deliveryAddress: { street: 'Gran Via', city: 'Madrid' },
        });
        for (const name of ['countryCode', 'shopperLocale', 'deliveryAddress.country']) {
            expect(payload).not.toHaveProperty(name);
        }
        await expect(page.getByText('Payment link created')).toBeVisible();
    });
});
