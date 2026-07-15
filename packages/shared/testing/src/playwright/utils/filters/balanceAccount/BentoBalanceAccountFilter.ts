import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import AbstractBalanceAccountFilter from './AbstractBalanceAccountFilter';

export default class BentoBalanceAccountFilter extends AbstractBalanceAccountFilter {
    constructor(scope: Page | Locator) {
        super();

        // [TODO]: Address misaligned ARIA labels and attributes for Bento filter components
        this._button = scope.getByRole('button', { name: /^Balance account/, disabled: false });
        this._dialog = this._button.page().getByRole('dialog', { name: 'Balance account', exact: true });
        this._selected = this._dialog.getByRole('option', { disabled: false, selected: true });
        this._unselected = this._dialog.getByRole('option', { disabled: false, selected: false });
        this._applyButton = this._dialog.getByRole('button', { name: 'Apply', exact: true });
        this._resetButton = this._dialog.getByRole('button', { name: 'Reset', exact: true });
    }

    protected override async _expectExpanded() {
        await super._expectExpanded();
        await expect(this._applyButton).toBeVisible();
        await expect(this._resetButton).toBeVisible();
    }

    protected override async _isExpanded() {
        await Promise.all([
            this._applyButton.waitFor({ state: 'visible', timeout: 100 }),
            this._resetButton.waitFor({ state: 'visible', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await super._isExpanded()
            && await this._applyButton.isVisible()
            && await this._resetButton.isVisible();
    }
}
