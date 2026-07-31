import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--restricted-stores';

test.describe('Payment Links Overview - Restricted stores', () => {
    let requestedStoreIds: string[];

    test.beforeEach(async ({ page }) => {
        const listRequest = page.waitForRequest(request => request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/paymentLinks'));
        await goToStory(page, { id: STORY_ID });
        requestedStoreIds = new URL((await listRequest).url()).searchParams.getAll('storeIds');
    });

    test('should only expose stores permitted by the prop', async ({ page }) => {
        expect(requestedStoreIds).toEqual(['STORE_NY_001', 'STORE_LON_001']);
        await page.getByRole('button', { name: 'Stores', exact: true }).click();

        await Promise.all([
            expect(page.getByRole('checkbox', { name: 'NY001', exact: true })).toBeVisible(),
            expect(page.getByRole('checkbox', { name: 'LN001', exact: true })).toBeVisible(),
            expect(page.getByRole('checkbox', { name: 'AM001', exact: true })).toHaveCount(0),
        ]);
    });
});
