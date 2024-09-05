import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath, getTranslatedKey } from '../../utils/utils';

export class TransactionDetailsPage extends BasePage {
    public readonly transactionValue: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-pe-overview-details') {
        super(page, rootElementSelector, getPagePath('transaction'));
        this.transactionValue = this.rootElement.getByLabel(`${getTranslatedKey('referenceID')}`);
    }
}
