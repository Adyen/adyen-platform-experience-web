import type { Locator, Page } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

export class TransactionDetailsPage {
    private readonly root: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-pe-overview-details') {
        this.root = page.locator(rootElementSelector);
    }

    get referenceId(): Locator {
        return this.root.getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`).locator('dd');
    }
}
