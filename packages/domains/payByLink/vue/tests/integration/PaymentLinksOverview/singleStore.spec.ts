import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { openCreatePaymentLinkModal } from '../../../../fixtures/integration/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--single-store';

test.describe('Payment Links Overview - Single store', () => {
    let requestedStoreIds: string[];

    test.beforeEach(async ({ page }) => {
        const listRequest = page.waitForRequest(request => request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/paymentLinks'));
        await goToStory(page, { id: STORY_ID });
        requestedStoreIds = new URL((await listRequest).url()).searchParams.getAll('storeIds');
    });

    test('should restrict the overview and creation flow to the provided store', async ({ page }) => {
        expect(requestedStoreIds).toEqual(['STORE_NY_001']);
        await expect(page.getByRole('button', { name: 'Stores', exact: true })).toHaveCount(0);

        const dialog = await openCreatePaymentLinkModal(page);

        await expect(dialog.getByTestId('form-field-store')).toHaveCount(0);
        await expect(dialog.getByTestId('form-field-amount.value')).toBeVisible();
    });
});
