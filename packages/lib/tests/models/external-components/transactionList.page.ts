import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath, getTranslatedKey } from '../../utils/utils';
import DataGridPage from '../internal-components/dataGrid';
import FilterBarPage from '../internal-components/filterBar';
import { ITransaction } from '@src/types';
import { TRANSACTIONS } from '@adyen/adyen-platform-experience-web-mocks';

export class TransactionListPage extends BasePage {
    private dataGrid: DataGridPage;
    public dataGridBody: Locator;
    public filterBar: Locator;
    public balanceAccountFilter: Locator;
    public accountHolderFilter: Locator;
    public dateFilter: Locator;
    public clearFilterButton: Locator;
    public applyFilterButton: Locator;
    public filterSingleInput: Locator;
    public firstRow: Locator;
    public gridCount: number;

    constructor(page: Page, mockedList: ITransaction[] = TRANSACTIONS, rootElementSelector = '.transactions-component-container') {
        super(page, rootElementSelector, getPagePath('transactionList'));
        const dataGrid = new DataGridPage(this.rootElement);
        this.dataGrid = dataGrid;
        this.dataGridBody = dataGrid.gridBody;
        this.gridCount = mockedList.length;
        this.firstRow = dataGrid.getRow();

        const filterBar = new FilterBarPage(this.rootElement);
        this.filterBar = filterBar.rootElement;
        this.balanceAccountFilter = filterBar.getFilter(getTranslatedKey('balanceAccount'));
        this.accountHolderFilter = filterBar.getFilter(getTranslatedKey('account'));
        this.dateFilter = filterBar.getFilter(getTranslatedKey('rangePreset.last7Days'));
        this.clearFilterButton = filterBar.getFilterButton(getTranslatedKey('reset'));
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
