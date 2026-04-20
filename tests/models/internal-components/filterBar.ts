import type { Locator, Page } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class FilterBarPage {
    public rootElement: Locator;

    constructor(page: Page, rootElementSelector?: string) {
        const rootElement = rootElementSelector ? page.locator(rootElementSelector) : page.getByTestId('component-root');

        this.rootElement = rootElement.getByTestId('filter-bar');
    }

    getFilter(label: string) {
        return this.rootElement.getByText(label, { exact: true });
    }
    getFilterButton(label: string) {
        return this.rootElement.getByRole('button', { name: label, exact: true });
    }
}

export default FilterBarPage;
