import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--with-props-to-sub-components';

test.describe('PayByLinkOverview - With props to sub-components', () => {
    test('should drill the props down to the settings sub component', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: 'Open link settings' }).click();

        await expect(page.getByText('Settings')).not.toBeVisible();
    });

    test('should drill the props down to the link creation sub component', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: 'Create payment link' }).click();

        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        const merchantReferenceValue = await page.locator('input[name="reference"]').inputValue();

        expect(merchantReferenceValue).toBe('Prefilled Merchant Reference');
    });
});
