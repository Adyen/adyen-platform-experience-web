import { Locator } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class FilterBarPage {
    public rootElement: Locator;

    constructor(rootElement: Locator) {
        this.rootElement = rootElement.getByLabel(getTranslatedKey('filterBar'));
    }

    getFilter(label: string) {
        return this.rootElement.getByLabel(label, { exact: true });
    }
    getFilterButton(label: string) {
        return this.rootElement.getByRole('button', { name: label, exact: true });
    }
}

export default FilterBarPage;
