import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../models/basePage';
import { pages } from '../../../../playground/pages';

const path = pages.find(page => page.id === 'accountHolder')?.id ?? '';

export class AccountHolderPage extends BasePage {
    public readonly accountHolderValue: Locator;

    constructor(page: Page, rootElementSelector = '.account-holder-component-container') {
        super(page, rootElementSelector, path);
        this.accountHolderValue = this.rootElement.getByLabel('Account holder ID').getByLabel('value');
    }
}
