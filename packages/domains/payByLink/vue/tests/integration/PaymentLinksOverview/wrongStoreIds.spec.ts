import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--wrong-store-ids';

test.describe('Payment Links Overview - Wrong store IDs', () => {
    let requestedStoreIds: string[];

    test.beforeEach(async ({ page }) => {
        const listRequest = page.waitForRequest(request => request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/paymentLinks'));
        await goToStory(page, { id: STORY_ID });
        requestedStoreIds = new URL((await listRequest).url()).searchParams.getAll('storeIds');
    });

    test('should display the wrong-store error', async ({ page }) => {
        expect(requestedStoreIds).toEqual(['UNKNOWN_STORE']);
        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText('Looks like there is a problem with the store ID.', { exact: true })).toBeVisible(),
            expect(page.getByText('Contact support for help.', { exact: true })).toBeVisible(),
        ]);
    });
});
