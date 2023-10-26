import { Locator } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class DataGridPage {
    public rootElement: Locator;

    constructor(rootElement: Locator) {
        this.rootElement = rootElement.getByRole('table');
    }

    getValue(label: string) {
        return this.rootElement.getByLabel(`${label} ${getTranslatedKey('value')}`);
    }
}

export default DataGridPage;
