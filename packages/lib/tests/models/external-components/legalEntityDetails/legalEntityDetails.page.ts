import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../basePage';
import { getPagePath, getTranslatedKey } from '../../../utils/utils';
import TabsPage from '../../internal-components/tabs';
import StructuredListPage from '../../internal-components/structuredList';
export class LegalEntityDetailsPage extends BasePage {
    public readonly legalEntityValues: Locator;
    public readonly transferInstruments: Locator;
    public readonly id: Locator;
    public readonly type: Locator;
    public readonly selectedTab: Locator;
    public readonly transferInstrumentsTab: Locator;
    private structuredList: StructuredListPage;

    constructor(page: Page, rootElementSelector = '.legal-entity-component-container') {
        super(page, rootElementSelector, getPagePath('legalEntityDetails'));
        const tabs = new TabsPage(this.rootElement);
        const structuredList = new StructuredListPage(this.rootElement);
        this.structuredList = structuredList;
        this.legalEntityValues = structuredList.rootElement;
        this.selectedTab = tabs.getSelectedTab();

        this.id = structuredList.getValue(getTranslatedKey('id'));

        this.type = structuredList.getValue(getTranslatedKey('legalEntityType'));
        this.transferInstrumentsTab = tabs.getTab(getTranslatedKey('transferInstruments'));
        this.transferInstruments = tabs.getTabContent('#panel-id-transferInstruments');
    }

    getListValue(field: string) {
        return this.structuredList.getValue(field);
    }
}
