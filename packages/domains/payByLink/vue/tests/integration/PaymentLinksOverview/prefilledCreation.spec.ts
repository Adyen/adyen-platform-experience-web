import { expect, test } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';
import { openCreatePaymentLinkModal } from '../../../../fixtures/integration/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--prefilled-creation';

test.describe('Payment Links Overview - Creation modal titles', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should keep success titles in the content and restore the modal header for details', async ({ page }) => {
        const dialog = await openCreatePaymentLinkModal(page);
        const title = dialog.locator('.b-modal-page__title');

        await expect(title).toHaveText('New payment link');
        await dialog.getByRole('button', { name: 'Continue' }).click();
        await dialog.getByRole('button', { name: 'Continue' }).click();
        await dialog.getByRole('button', { name: 'Create payment link' }).click();

        await Promise.all([
            expect(title).toBeEmpty(),
            expect(dialog.getByText('Payment link created', { exact: true })).toBeVisible(),
            expect(dialog.getByText('Payment link created', { exact: true })).toHaveCount(1),
            expect(dialog.getByText('New payment link', { exact: true })).toHaveCount(0),
        ]);

        await dialog.getByRole('button', { name: 'Show details' }).click();

        await Promise.all([
            expect(dialog).toHaveAccessibleName('Payment link details'),
            expect(title).toHaveText('Payment link details'),
            expect(dialog.getByText('Payment link details', { exact: true })).toHaveCount(1),
            expect(dialog.getByRole('tab', { name: 'Link information' })).toBeVisible(),
        ]);

        await dialog.getByRole('button', { name: 'Expire now' }).click();
        await dialog.getByRole('button', { name: 'Expire link' }).click();
        await Promise.all([
            expect(title).toBeEmpty(),
            expect(dialog.getByText('Link has been deactivated', { exact: true })).toBeVisible(),
            expect(dialog.getByText('Link has been deactivated', { exact: true })).toHaveCount(1),
        ]);

        await dialog.getByRole('button', { name: 'Show details' }).click();
        await expect(title).toHaveText('Payment link details');
    });
});
