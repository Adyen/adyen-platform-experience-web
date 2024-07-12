import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath, getTranslatedKey } from '../../utils/utils';
import DataGridPage from '../internal-components/dataGrid';
import FilterBarPage from '../internal-components/filterBar';

const MONTHS_WITH_30_DAYS = [3, 5, 8, 10] as const;

export class TransactionListPage extends BasePage {
    private dataGrid: DataGridPage;
    public dataGridBody: Locator;
    public filterBar: Locator;
    public balanceAccountFilter: Locator;
    public dateFilter: Locator;
    public firstRow: Locator;

    constructor(page: Page, rootElementSelector = '.transactions-component-container') {
        super(page, rootElementSelector, getPagePath('transactionList'));
        this.dataGrid = new DataGridPage(this.rootElement);
        this.dataGridBody = this.dataGrid.gridBody;
        this.firstRow = this.dataGrid.getRow();

        const filterBar = new FilterBarPage(this.rootElement);
        this.filterBar = filterBar.rootElement;
        this.balanceAccountFilter = filterBar.getFilter(getTranslatedKey('balanceAccount'));
        this.dateFilter = filterBar.getFilter(getTranslatedKey('rangePreset.last30Days'));
    }

    getCell(id: string, row = 0) {
        return this.dataGrid.getCell(id, row);
    }

    async applyDateFilter(from: Date | number | string = Date(), to: Date | number | string = from) {
        await this.dateFilter.click();
        const applyButton = this.page.getByLabel(getTranslatedKey('apply'));
        const previousMonthButton = this.page.getByLabel(getTranslatedKey('calendar.previousMonth'));

        const now = new Date();
        const twoYearsAgo = new Date(now).setMonth(now.getMonth() - 24);

        let fromDate = new Date(Math.max(Math.min(new Date(from).getTime(), now.getTime()), twoYearsAgo));
        let toDate = new Date(Math.min(new Date(to).getTime(), now.getTime()));
        if (fromDate > toDate) [fromDate, toDate] = [toDate, fromDate];

        const rangeDates = [fromDate, toDate, now];

        for (let i = 1; i >= 0; i--) {
            const date = rangeDates[i]!;
            const origin = rangeDates[i + 1]!;
            const originDate = origin.getDate();
            const originMonth = origin.getMonth();

            const diff = (origin.getFullYear() - date.getFullYear()) * 12 + (originMonth - date.getMonth());
            const years = Math.floor(diff / 12);
            let months = diff % 12;

            if (months) {
                const nearestShorterMonth = originDate === 31 ? MONTHS_WITH_30_DAYS.findLast(month => month < originMonth) ?? 1 : 1;
                switch (originDate) {
                    case 30:
                    case 31:
                        if (originMonth - months <= nearestShorterMonth) months++;
                        break;
                }
            } else if (years && originMonth === 1 && originDate === 29) months++;

            for (let i = 0; i < years; i++) await previousMonthButton.click({ modifiers: ['Shift'] });
            for (let i = 0; i < months; i++) await previousMonthButton.click();

            const firstDayCursorPosition = Number(await this.page.locator(`[data-first-month-day='1']`).getAttribute('data-cursor-position'));
            const dayOfMonth = this.page.locator(`[data-cursor-position='${firstDayCursorPosition + date.getDate() - 1}']`);

            await dayOfMonth.click();

            if (i > 0) await dayOfMonth.click();
        }

        await applyButton.click();
    }
}
