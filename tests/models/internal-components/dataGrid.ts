import type { Locator, Page } from '@playwright/test';

class DataGridPage {
    public rootElement: Locator;
    public readonly gridBody: Locator;

    constructor(page: Page, rootElementSelector: string) {
        this.rootElement = page.locator(rootElementSelector).getByRole('table');
        this.gridBody = this.rootElement.getByRole('rowgroup').nth(1);
    }

    getCell(label: string, row = 0) {
        return this.getRow(row).locator(`div[aria-labelledby=${label}]`);
    }
    getRow(row = 0) {
        return this.gridBody.getByRole('row').nth(row);
    }
    getHeader(label: string) {
        return this.rootElement.getByRole('columnheader', { name: label });
    }
}

export default DataGridPage;
