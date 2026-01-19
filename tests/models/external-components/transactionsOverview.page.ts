import type { Locator, Page } from '@playwright/test';
import { applyDateFilter, getTranslatedKey } from '../../utils/utils';
import DataGridPage from '../internal-components/dataGrid';
import FilterBarPage from '../internal-components/filterBar';

// Duplicated from src/ to avoid importing runtime code that pulls in SCSS/JSON
const TRANSACTION_DATE_RANGE_MAX_YEARS = 2;
const DATE_FILTER_LABEL_KEY = 'common.filters.types.date.rangeSelect.options.last180Days';

export class TransactionsOverviewPage {
    private readonly _applyDateFilter;
    public dataGrid: DataGridPage;
    public dataGridBody: Locator;
    public filterBar: Locator;
    public balanceAccountFilter: Locator;
    public dateFilter: Locator;
    public firstRow: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-pe-transactions-overview-container') {
        this.dataGrid = new DataGridPage(page, rootElementSelector);
        this.dataGridBody = this.dataGrid.gridBody;
        this.firstRow = this.dataGrid.getRow();

        const filterBar = new FilterBarPage(page, rootElementSelector);
        this.filterBar = filterBar.rootElement;
        this.balanceAccountFilter = filterBar.getFilter(getTranslatedKey('common.filters.types.account.label'));
        this.dateFilter = filterBar.getFilter(getTranslatedKey(DATE_FILTER_LABEL_KEY));

        this._applyDateFilter = applyDateFilter(page, {
            earliestDate: now => {
                const earliest = new Date(now);
                earliest.setFullYear(earliest.getFullYear() - TRANSACTION_DATE_RANGE_MAX_YEARS);
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
