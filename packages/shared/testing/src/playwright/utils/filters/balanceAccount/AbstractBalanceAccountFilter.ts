import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

export default abstract class AbstractBalanceAccountFilter {
    protected _button!: Locator;
    protected _dialog!: Locator;
    protected _selected!: Locator;
    protected _unselected!: Locator;
    protected _applyButton!: Locator;
    protected _resetButton!: Locator;

    protected async _expectCollapsed() {
        await expect(this._dialog).toBeHidden();
    }

    protected async _expectExpanded() {
        await expect(this._dialog).toBeVisible();
    }

    protected async _isCollapsed() {
        return this._dialog.isHidden();
    }

    protected async _isExpanded() {
        return this._dialog.isVisible();
    }

    get button() {
        return this._button;
    }

    get dialog() {
        return this._dialog;
    }

    get selected() {
        return this._selected;
    }

    get unselected() {
        return this._unselected;
    }

    async collapse(mode?: 'clickButton' | 'clickOutside') {
        if (mode) await this._expectExpanded();

        if (await this._isExpanded()) {
            switch (mode) {
                case 'clickOutside':
                    await this._button.page().click('body', { position: { x: 0, y: 0 } });
                    break;

                case 'clickButton':
                default:
                    await this._button.click();
                    break;
            }
        }

        await this._expectCollapsed();
    }

    async expand(mode?: 'clickButton') {
        if (mode) await this._expectCollapsed();

        if (await this._isCollapsed()) {
            switch (mode) {
                case 'clickButton':
                default:
                    await this._button.click();
                    break;
            }
        }

        await this._expectExpanded();
    }

    async selectFirstUnselected() {
        await this.expand();

        const firstUnselectedOption = this._unselected.nth(0);
        const balanceAccountId = await firstUnselectedOption.getByText(/^BA\S+$/).textContent();

        await firstUnselectedOption.click();

        if (await this._applyButton.isVisible()) {
            await expect(this._applyButton).toBeEnabled();
            await this._applyButton.click();
        }

        await this._expectCollapsed();
        return balanceAccountId;
    }
}
