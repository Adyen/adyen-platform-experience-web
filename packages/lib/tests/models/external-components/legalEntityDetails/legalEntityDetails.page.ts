import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../basePage';
import { getPagePath, getTranslatedKey } from '../../../utils/utils';
import TabsPage from '../../internal-components/tabs';
export class LegalEntityDetailsPage extends BasePage {
    public readonly legalEntityValues: Locator;
    public readonly transferInstruments: Locator;
    public readonly id: Locator;
    public readonly type: Locator;
    public readonly selectedTab: Locator;
    public readonly transferInstrumentsTab: Locator;

    constructor(page: Page, rootElementSelector = '.legal-entity-component-container') {
        super(page, rootElementSelector, getPagePath('legalEntityDetails'));
        const tabs = new TabsPage(this.rootElement);
        this.legalEntityValues = this.rootElement.getByLabel(getTranslatedKey('structuredList'));
        this.selectedTab = tabs.getSelectedTab();

        this.id = tabs.getListValue('value-id');

        this.type = tabs.getListValue('value-legalEntityType');
        this.transferInstrumentsTab = tabs.getTab(getTranslatedKey('transferInstruments'));
        this.transferInstruments = tabs.getTabContent('#panel-id-transferInstruments');
    }
}
