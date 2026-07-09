import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import AbstractBalanceAccountFilter from './AbstractBalanceAccountFilter';

const defaultButtonLocatorOptions = { name: 'Balance account', exact: true, disabled: false };

export default class DefaultBalanceAccountFilter extends AbstractBalanceAccountFilter {
    private readonly _buttonCollapsed!: Locator;
    private readonly _buttonExpanded!: Locator;

    constructor(scope: Page | Locator) {
        super();

        this._button = scope.getByRole('button', defaultButtonLocatorOptions);
        this._buttonCollapsed = scope.getByRole('button', { ...defaultButtonLocatorOptions, expanded: false });
        this._buttonExpanded = scope.getByRole('button', { ...defaultButtonLocatorOptions, expanded: true });

        this._dialog = this._button.page().getByRole('dialog', { name: 'Balance account', exact: true });
        this._selected = this._dialog.getByRole('option', { disabled: false, selected: true });
        this._unselected = this._dialog.getByRole('option', { disabled: false, selected: false });
        this._applyButton = this._dialog.getByRole('button', { name: 'Apply', exact: true });
        this._resetButton = this._dialog.getByRole('button', { name: 'Reset', exact: true });
    }

    protected override async _expectCollapsed() {
        await super._expectCollapsed();
        await expect(this._buttonCollapsed).toBeVisible();
        await expect(this._buttonExpanded).toBeHidden();
    }

    protected override async _expectExpanded() {
        await super._expectExpanded();
        await expect(this._buttonCollapsed).toBeHidden();
        await expect(this._buttonExpanded).toBeVisible();
    }

    protected override async _isCollapsed() {
        await Promise.all([
            this._buttonCollapsed.waitFor({ state: 'visible', timeout: 100 }),
            this._buttonExpanded.waitFor({ state: 'hidden', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await super._isCollapsed()
            && await this._buttonCollapsed.isVisible()
            && await this._buttonExpanded.isHidden();
    }

    protected override async _isExpanded() {
        await Promise.all([
            this._buttonCollapsed.waitFor({ state: 'hidden', timeout: 100 }),
            this._buttonExpanded.waitFor({ state: 'visible', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await super._isExpanded()
            && await this._buttonCollapsed.isHidden()
            && await this._buttonExpanded.isVisible();
    }
}
