import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { openCreatePaymentLinkModal } from '../../../../fixtures/integration/utils';
import {
    PREFILLED_MERCHANT_REFERENCE,
    PREFILLED_STORE,
    WITH_PROPS_TO_SUB_COMPONENTS_STORY_ID,
} from '../../../../fixtures/constants/PaymentLinksOverview';

test.describe('PayByLinkOverview - With props to sub-components', () => {
    test('should drill the props down to the settings sub component', async ({ page }) => {
        // [TODO]: PaymentLinkSettings is not yet migrated to Vue, so paymentLinkSettings props cannot be drilled down yet
        test.fixme(true, 'PaymentLinkSettings is not yet migrated to Vue');

        await goToStory(page, { id: WITH_PROPS_TO_SUB_COMPONENTS_STORY_ID });

        await page.getByRole('button', { name: /settings/i }).click();

        await expect(page.getByText('Settings')).not.toBeVisible();
    });

    test('should drill the props down to the link creation sub component', async ({ page }) => {
        // [TODO]: PaymentLinkCreation is not yet migrated to Vue, so paymentLinkCreation props cannot be drilled down yet
        test.fixme(true, 'PaymentLinkCreation is not yet migrated to Vue');
        await goToStory(page, { id: WITH_PROPS_TO_SUB_COMPONENTS_STORY_ID });

        await openCreatePaymentLinkModal(page);

        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: PREFILLED_STORE }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        const merchantReferenceValue = await page.getByTestId('form-field-reference').getByRole('textbox').inputValue();

        expect(merchantReferenceValue).toBe(PREFILLED_MERCHANT_REFERENCE);
    });
});
