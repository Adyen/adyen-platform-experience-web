import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--single-options';

test.beforeEach(async ({ page }) => {
    await setTime(page);
    await goToStory(page, { id: STORY_ID });
});

test.describe('Payment link creation - Single options', () => {
    for (const withPhoneNumber of [true, false]) {
        test(`Should preselect all single options and submit ${withPhoneNumber ? 'with' : 'without'} an optional phone number`, async ({ page }) => {
            await Promise.all([
                expect(page.getByTestId('form-field-store')).toBeHidden(),
                expect(page.getByRole('combobox', { name: 'Validity' })).toHaveText('24 hours'),
                expect(page.getByRole('combobox', { name: 'Amount currency' })).toHaveText('EUR'),
                expect(page.getByRole('combobox', { name: 'Link type' })).toHaveText('Single use'),
            ]);
            await page.getByRole('button', { name: 'Continue' }).click();

            await Promise.all([
                expect(page.getByRole('combobox', { name: 'Country/Region' })).toHaveText('Spain'),
                expect(page.getByTestId('form-field-billingAddress.country').getByRole('combobox')).toHaveText('Spain'),
                expect(page.getByTestId('form-field-deliveryAddress.country').getByRole('combobox')).toHaveText('Spain'),
                expect(page.getByRole('combobox', { name: 'Language' })).toHaveText('Español'),
                expect(page.getByRole('combobox', { name: 'Phone prefix' })).toHaveText('ES (+34)'),
                expect(page.getByRole('textbox', { name: 'Shopper phone' })).toHaveValue(''),
            ]);

            if (withPhoneNumber) await page.getByRole('textbox', { name: 'Shopper phone' }).fill('3002119220');

            await page.getByRole('button', { name: 'Continue' }).click();
            await page.getByRole('button', { name: 'Go back', exact: true }).click();
            await Promise.all([
                expect(page.getByRole('combobox', { name: 'Country/Region' })).toHaveText('Spain'),
                expect(page.getByRole('combobox', { name: 'Language' })).toHaveText('Español'),
                expect(page.getByRole('combobox', { name: 'Phone prefix' })).toHaveText('ES (+34)'),
                expect(page.getByRole('textbox', { name: 'Shopper phone' })).toHaveValue(withPhoneNumber ? '3002119220' : ''),
            ]);
            await page.getByRole('button', { name: 'Continue' }).click();

            const requestPromise = page.waitForRequest(request => request.method() === 'POST' && request.url().includes('/paybylink/paymentLinks'));
            await page.getByRole('button', { name: 'Create payment link' }).click();
            const request = await requestPromise;
            const payload = request.postDataJSON();
            expect(payload).toMatchObject({
                amount: { currency: 'EUR', value: 12345 },
                linkType: 'singleUse',
                linkValidity: { quantity: 24, durationUnit: 'hour' },
                countryCode: 'ES',
                billingAddress: { country: 'ES' },
                deliveryAddress: { country: 'ES' },
                shopperLocale: 'es-ES',
            });
            if (withPhoneNumber) {
                expect(payload).toHaveProperty('telephoneNumber', '+343002119220');
            } else {
                expect(payload).not.toHaveProperty('telephoneNumber');
            }
            await expect(page.getByText('Payment link created')).toBeVisible();
        });
    }
});
