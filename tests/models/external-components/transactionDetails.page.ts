import type { Locator, Page } from '@playwright/test';

export class TransactionDetailsPage {
    private readonly root: Locator;

    constructor(page: Page, rootElementSelector?: string) {
        this.root = rootElementSelector ? page.locator(rootElementSelector) : page.getByTestId('component-root');
    }

    get referenceId(): Locator {
        return this.root.getByTestId('id-value');
    }
}
