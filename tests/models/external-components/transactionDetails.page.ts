import { Locator, Page } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

export class TransactionDetailsPage {
    public readonly transactionValue: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-pe-overview-details') {
        this.transactionValue = page.locator(rootElementSelector).getByLabel(`${getTranslatedKey('referenceID')}`);
    }
}
