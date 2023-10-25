import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../basePage';
import { getPagePath, getTranslatedKey } from '../../../utils/utils';
export class BalanceAccountPage extends BasePage {
    public readonly balanceAccountValue: Locator;

    constructor(page: Page, rootElementSelector = '.balance-account-component-container') {
        super(page, rootElementSelector, getPagePath('balanceAccount'));
        this.balanceAccountValue = this.rootElement.getByLabel(getTranslatedKey('balanceAccountId')).getByLabel('value');
    }
}
