import type { Locator, Page } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class FilterBarPage {
    public rootElement: Locator;

    constructor(page: Page, rootElementSelector: string) {
        this.rootElement = page.locator(rootElementSelector).getByTestId('filter-bar');
    }

    getFilter(label: string) {
        return this.rootElement.getByText(label, { exact: true });
    }
    getFilterButton(label: string) {
        return this.rootElement.getByRole('button', { name: label, exact: true });
    }
}

export default FilterBarPage;
