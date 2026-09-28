import { test, expect, type Page } from '@playwright/test';

/**
 * All routes in the integration-demo app, their container IDs, and a
 * human-readable label for the test name.
 */
const ROUTES = [
    { path: '/', containerId: 'capital-overview-container', label: 'CapitalOverview' },
    { path: '/capital-offer', containerId: 'capital-offer-container', label: 'CapitalOffer' },
    { path: '/disputes', containerId: 'disputes-overview-container', label: 'DisputesOverview' },
    { path: '/dispute-management', containerId: 'dispute-management-container', label: 'DisputeManagement' },
    { path: '/payment-links', containerId: 'payment-links-overview-container', label: 'PaymentLinksOverview' },
    { path: '/payment-link-creation', containerId: 'payment-link-creation-container', label: 'PaymentLinkCreation' },
    { path: '/payment-link-details', containerId: 'payment-link-details-container', label: 'PaymentLinkDetails' },
    { path: '/payment-link-settings', containerId: 'payment-link-settings-container', label: 'PaymentLinkSettings' },
    { path: '/payouts', containerId: 'payouts-overview-container', label: 'PayoutsOverview' },
    { path: '/payout-details', containerId: 'payout-details-container', label: 'PayoutDetails' },
    { path: '/reports', containerId: 'reports-overview-container', label: 'ReportsOverview' },
    { path: '/transactions', containerId: 'transactions-overview-container', label: 'TransactionsOverview' },
    { path: '/transaction-details', containerId: 'transaction-details-container', label: 'TransactionDetails' },
] as const;

/**
 * Collects console errors from the page. Returns the list so tests can assert
 * no unexpected errors occurred during component mounting.
 */
function trackConsoleErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    return errors;
}

for (const route of ROUTES) {
    test(`${route.label} (${route.path}) — renders and mounts SDK component`, async ({ page }) => {
        const consoleErrors = trackConsoleErrors(page);

        await page.goto(route.path);

        // Container div should be present
        const container = page.locator(`#${route.containerId}`);
        await expect(container).toBeVisible();

        // Wait for the SDK to mount — Adyen PE components render elements with
        // class names prefixed with "adyen-pe-"
        const sdkElement = container.locator('[class*="adyen-pe-"]').first();
        await expect(sdkElement).toBeVisible({ timeout: 30_000 });

        // Verify CSS loaded — SDK elements should have non-zero dimensions
        const box = await sdkElement.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);

        // No unexpected console errors (filter out known noise if needed)
        const unexpectedErrors = consoleErrors.filter(msg => !msg.includes('favicon') && !msg.includes('HMR'));
        expect(unexpectedErrors).toEqual([]);
    });
}
