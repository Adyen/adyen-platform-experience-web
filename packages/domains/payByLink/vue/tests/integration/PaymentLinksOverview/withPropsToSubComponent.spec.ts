import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--with-props-to-sub-components';

test.describe('PayByLinkOverview - With props to sub-components', () => {
    test('should drill the props down to the settings sub component', async ({ page }) => {
        // [TODO]: PaymentLinkSettings is not yet migrated to Vue, so paymentLinkSettings props cannot be drilled down yet
        test.fixme(true, 'PaymentLinkSettings is not yet migrated to Vue');

        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: /settings/i }).click();

        await expect(page.getByText('Settings')).not.toBeVisible();
    });

    test('should drill the props down to the link creation sub component', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: 'Create payment link' }).click();

        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        const merchantReferenceValue = await page.getByTestId('form-field-reference').getByRole('textbox').inputValue();

        expect(merchantReferenceValue).toBe('Prefilled Merchant Reference');
    });
});
