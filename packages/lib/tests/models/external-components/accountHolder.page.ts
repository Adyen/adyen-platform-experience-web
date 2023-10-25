import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { getPagePath } from '../../utils/utils';

export class AccountHolderPage extends BasePage {
    public readonly accountHolderValue: Locator;

    constructor(page: Page, rootElementSelector = '.account-holder-component-container') {
        super(page, rootElementSelector, getPagePath('accountHolder'));
        this.accountHolderValue = this.rootElement.getByLabel('Account holder ID').getByLabel('value');
    }
}
