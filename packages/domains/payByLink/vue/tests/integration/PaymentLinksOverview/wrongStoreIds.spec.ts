import { expect, test, type Request } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--wrong-store-ids';

test.describe('Payment Links Overview - Wrong store IDs', () => {
    test('should display the wrong-store error without requesting payment links', async ({ page }) => {
        const paymentLinksRequests: URL[] = [];

        const collectPaymentLinksRequests = (request: Request) => {
            const url = new URL(request.url());
            if (request.method() === 'GET' && url.pathname.endsWith('/paymentLinks')) paymentLinksRequests.push(url);
        };

        page.on('request', collectPaymentLinksRequests);

        try {
            await goToStory(page, { id: STORY_ID });

            await Promise.all([
                expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
                expect(page.getByText('Looks like there is a problem with the store ID.', { exact: true })).toBeVisible(),
                expect(page.getByText('Contact support for help.', { exact: true })).toBeVisible(),
            ]);
        } finally {
            page.off('request', collectPaymentLinksRequests);
        }

        expect(paymentLinksRequests).toEqual([]);
    });
});
