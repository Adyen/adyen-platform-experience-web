import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath } from '../../utils/utils';

import DataGridPage from '../internal-components/dataGrid';
export class TransactionListPage extends BasePage {
    public readonly paymentIdCell: Locator;
    public readonly balanceAccountCell: Locator;
    public readonly accountHolderCell: Locator;
    private dataGrid: DataGridPage;
    constructor(page: Page, rootElementSelector = '.transactions-component-container') {
        super(page, rootElementSelector, getPagePath('transactionList'));
        const dataGrid = new DataGridPage(this.rootElement);
        this.dataGrid = dataGrid;
        this.paymentIdCell = dataGrid.getCell('id');
        this.balanceAccountCell = dataGrid.getCell('balanceAccountId');
        this.accountHolderCell = dataGrid.getCell('accountHolderId');
    }

    getCell(id: string, row = 0) {
        return this.dataGrid.getCell(id, row);
    }
}
