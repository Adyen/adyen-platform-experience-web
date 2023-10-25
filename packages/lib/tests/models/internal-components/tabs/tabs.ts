import { Locator, Page } from '@playwright/test';

class TabsPage {
    private page: Page;
    public rootElement: Locator;

    constructor(page: Page) {
        this.page = page;
        this.rootElement = this.page.locator('.legal-entity-component-container');
    }

    getSelectedTab() {
        return this.rootElement.getByRole('tab', { selected: true });
    }

    getTab(label: string) {
        return this.rootElement.getByRole('tab').getByText(label);
    }

    getListValue(label: string) {
        return this.rootElement.getByLabel('structured-list').getByLabel(label);
    }

    getTabContent(label: string) {
        return this.rootElement.getByLabel('tab-content').locator(label);
    }
}

export default TabsPage;
