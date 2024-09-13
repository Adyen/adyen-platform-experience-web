import { MAX_TRANSACTIONS_DATE_RANGE_MONTHS } from '../../../src/components/external/TransactionsOverview/components/TransactionsOverview/constants';
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { applyDateFilter, getPagePath, getTranslatedKey } from '../../utils/utils';
import DataGridPage from '../internal-components/dataGrid';
import FilterBarPage from '../internal-components/filterBar';

export class TransactionListPage extends BasePage {
    private readonly _applyDateFilter;
    public dataGrid: DataGridPage;
    public dataGridBody: Locator;
    public filterBar: Locator;
    public balanceAccountFilter: Locator;
    public dateFilter: Locator;
    public firstRow: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-pe-transactions-overview-container') {
        super(page, rootElementSelector, getPagePath('transactionList'));
        this.dataGrid = new DataGridPage(this.rootElement);
        this.dataGridBody = this.dataGrid.gridBody;
        this.firstRow = this.dataGrid.getRow();

        const filterBar = new FilterBarPage(this.rootElement);
        this.filterBar = filterBar.rootElement;
        this.balanceAccountFilter = filterBar.getFilter(getTranslatedKey('balanceAccount'));
        this.dateFilter = filterBar.getFilter(getTranslatedKey('rangePreset.last30Days'));

        this._applyDateFilter = applyDateFilter(this.page, {
            earliestDate: now => {
                const earliest = new Date(now);
                earliest.setMonth(earliest.getMonth() - MAX_TRANSACTIONS_DATE_RANGE_MONTHS);
                return earliest;
            },
            latestDate: now => new Date(now),
        });
    }

    getCell(id: string, row = 0) {
        return this.dataGrid.getCell(id, row);
    }
    getHeader(id: string) {
        return this.dataGrid.getHeader(id);
    }

    async applyDateFilter(from: Date | number | string = Date(), to: Date | number | string = from) {
        await this.dateFilter.click();
        await this._applyDateFilter(from, to);
    }
}
