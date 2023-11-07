import { Locator } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class StructuredListPage {
    public rootElement: Locator;

    constructor(rootElement: Locator) {
        this.rootElement = rootElement.getByLabel(getTranslatedKey('structuredList'));
    }

    getValue(label: string) {
        return this.rootElement.getByLabel(`${label} ${getTranslatedKey('value')}`);
    }
}

export default StructuredListPage;
