import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { openCreatePaymentLinkModal, openSettingsModal } from '../../../../fixtures/integration/utils';
import {
    PREFILLED_MERCHANT_REFERENCE,
    PREFILLED_STORE,
    WITH_PROPS_TO_SUB_COMPONENTS_STORY_ID,
} from '../../../../fixtures/constants/PaymentLinksOverview';

test.describe('PayByLinkOverview - With props to sub-components', () => {
    test('should drill the props down to the settings sub component', async ({ page }) => {
        await goToStory(page, { id: WITH_PROPS_TO_SUB_COMPONENTS_STORY_ID });

        const dialog = await openSettingsModal(page);

        await expect(dialog.getByRole('button', { name: 'Terms and conditions', exact: true })).toBeVisible();
        await expect(dialog.getByRole('heading', { name: 'Settings', exact: true })).toHaveCount(0);
    });

    test('should drill the props down to the link creation sub component', async ({ page }) => {
        await goToStory(page, { id: WITH_PROPS_TO_SUB_COMPONENTS_STORY_ID });

        const dialog = await openCreatePaymentLinkModal(page);

        await dialog.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: PREFILLED_STORE }).click();
        await dialog.getByRole('button', { name: 'Continue' }).click();

        await expect(dialog.getByTestId('form-field-reference').getByRole('textbox')).toHaveValue(PREFILLED_MERCHANT_REFERENCE);
    });
});
