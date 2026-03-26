import type { Locator, Page } from '@playwright/test';

class DataGridPage {
    public rootElement: Locator;
    public readonly gridBody: Locator;

    constructor(page: Page, rootElementSelector?: string) {
        const rootElement = rootElementSelector ? page.locator(rootElementSelector) : page.getByTestId('component-root');

        this.rootElement = rootElement.getByRole('table');
        this.gridBody = this.rootElement.getByRole('rowgroup').nth(1);
    }

    getCell(testId: string, row = 0) {
        return this.getRow(row).getByTestId(testId);
    }
    getRow(row = 0) {
        return this.gridBody.getByRole('row').nth(row);
    }
    getHeader(label: string) {
        return this.rootElement.getByRole('columnheader', { name: label });
    }
}

export default DataGridPage;
