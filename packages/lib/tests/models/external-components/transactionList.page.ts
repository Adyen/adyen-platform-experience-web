import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath, getTranslatedKey } from '../../utils/utils';

import DataGridPage from '../internal-components/dataGrid';
import FilterBarPage from '../internal-components/filterBar';
import { ITransaction } from '@src/types';
import { BASIC_TRANSACTIONS_LIST } from '../../../../../mocks';
export class TransactionListPage extends BasePage {
    public readonly paymentIdCell: Locator;
    public readonly balanceAccountCell: Locator;
    public readonly accountHolderCell: Locator;
    private dataGrid: DataGridPage;
    public dataGridBody: Locator;
    public filterBar: Locator;
    public balanceAccountFilter: Locator;
    public accountHolderFilter: Locator;
    public dateFilter: Locator;
    public clearFilterButton: Locator;
    public applyFilterButton: Locator;
    public filterSingleInput: Locator;
    public gridCount: number;

    constructor(page: Page, mockedList: ITransaction[] = BASIC_TRANSACTIONS_LIST, rootElementSelector = '.transactions-component-container') {
        super(page, rootElementSelector, getPagePath('transactionList'));
        const dataGrid = new DataGridPage(this.rootElement);
        this.dataGrid = dataGrid;
        this.dataGridBody = dataGrid.gridBody;
        this.gridCount = mockedList.length;
        this.paymentIdCell = dataGrid.getCell('id');
        this.balanceAccountCell = dataGrid.getCell('balanceAccountId');
        this.accountHolderCell = dataGrid.getCell('accountHolderId');

        const filterBar = new FilterBarPage(this.rootElement);
        this.filterBar = filterBar.rootElement;
        this.balanceAccountFilter = filterBar.getFilter(getTranslatedKey('balanceAccount'));
        this.accountHolderFilter = filterBar.getFilter(getTranslatedKey('account'));
        this.dateFilter = filterBar.getFilter(getTranslatedKey('dateRange'));
        this.clearFilterButton = filterBar.getFilterButton(getTranslatedKey('clear'));
        this.applyFilterButton = filterBar.getFilterButton(getTranslatedKey('apply'));
        this.filterSingleInput = this.filterBar.locator('input');
    }

    getCell(id: string, row = 0) {
        return this.dataGrid.getCell(id, row);
    }

    async clearSingleInput(filter: 'accountHolderFilter' | 'balanceAccountFilter') {
        await this[filter].click();
        await this.clearFilterButton.click();
    }
}
