import { Locator } from '@playwright/test';

class DataGridPage {
    public rootElement: Locator;
    public readonly gridBody: Locator;

    constructor(rootElement: Locator) {
        this.rootElement = rootElement.getByRole('table');
        this.gridBody = this.rootElement.getByRole('rowgroup').nth(1);
    }

    getCell(label: string, row = 0) {
        return this.gridBody.getByRole('row').nth(row).locator(`div[aria-labelledby=${label}]`);
    }
    getRow(row = 0) {
        return this.gridBody.getByRole('row').nth(row);
    }
}

export default DataGridPage;
