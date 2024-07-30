import { Locator } from '@playwright/test';
import { getTranslatedKey } from '../../utils/utils';

class TabsPage {
    public rootElement: Locator;

    constructor(rootElement: Locator) {
        this.rootElement = rootElement.getByLabel(getTranslatedKey('tabs'));
    }

    getSelectedTab() {
        return this.rootElement.getByRole('tab', { selected: true });
    }

    getTab(label: string) {
        return this.rootElement.getByRole('tab').getByText(label);
    }

    getListValue(label: string) {
        return this.rootElement.getByLabel(getTranslatedKey('structuredList')).getByLabel(label);
    }

    getTabContent(label: string) {
        return this.rootElement.locator(label);
    }
}

export default TabsPage;
