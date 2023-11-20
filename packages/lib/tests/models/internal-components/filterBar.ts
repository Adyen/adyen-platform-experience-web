import { Locator } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class FilterBarPage {
    public rootElement: Locator;

    constructor(rootElement: Locator) {
        this.rootElement = rootElement.getByTestId(getTranslatedKey('filterBar'));
    }

    getFilter(label: string) {
        return this.rootElement.getByText(label, { exact: true });
    }
    getFilterButton(label: string) {
        return this.rootElement.getByRole('button', { name: label, exact: true });
    }
}

export default FilterBarPage;
