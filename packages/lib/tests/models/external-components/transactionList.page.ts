import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath } from '../../utils/utils';

import DataGridPage from '../internal-components/dataGrid';
export class TransactionListPage extends BasePage {
    public readonly dataGrid: Locator;

    constructor(page: Page, rootElementSelector = '.transactions-component-container') {
        super(page, rootElementSelector, getPagePath('transactionList'));
        const dataGrid = new DataGridPage(this.rootElement);
        this.dataGrid = dataGrid.rootElement;
    }
}
