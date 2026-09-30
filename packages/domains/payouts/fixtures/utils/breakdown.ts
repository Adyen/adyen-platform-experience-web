import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type PayoutBreakdownLabel = 'Adjustments' | 'Funds captured';

abstract class AbstractPayoutBreakdown {
    protected _root!: Locator;
    protected _toggleButton!: Locator;
    protected _toggleButtonCollapsed!: Locator;
    protected _toggleButtonExpanded!: Locator;
    protected _toggleContent!: Locator;

    protected constructor(
        readonly page: Page,
        readonly name: PayoutBreakdownLabel
    ) {}

    protected static getPairwiseLocators(_list: Locator, _item: [name: string, value: string]): readonly Locator[] {
        throw new Error('Not implemented');
    }

    protected get toggleButtonCollapsed() {
        return this._toggleButtonCollapsed;
    }

    protected get toggleButtonExpanded() {
        return this._toggleButtonExpanded;
    }

    get toggleButton() {
        return this._toggleButton;
    }

    get toggleContent() {
        return this._toggleContent;
    }

    async isExpanded() {
        return this.toggleButtonExpanded.isVisible();
    }

    async expectToBeCollapsed() {
        await expect(this.toggleButtonCollapsed).toBeVisible();
        await expect(this.toggleButtonExpanded).toBeHidden();
        await expect(this.toggleContent.first()).toBeHidden();
    }

    async expectToBeExpanded() {
        await expect(this.toggleButtonCollapsed).toBeHidden();
        await expect(this.toggleButtonExpanded).toBeVisible();
        await expect(this.toggleContent.first()).toBeVisible();
    }

    async toggle() {
        const toggleButton = (await this.isExpanded()) ? this.toggleButtonExpanded : this.toggleButtonCollapsed;
        await toggleButton.click();
    }
}

export class BentoPayoutBreakdown extends AbstractPayoutBreakdown {
    constructor(page: Page, name: PayoutBreakdownLabel) {
        super(page, name);

        this._root = page.getByTestId('card').filter({ has: page.getByRole('button', { name }) });
        this._toggleButton = this._root.getByRole('button', { name, disabled: false });
        this._toggleButtonCollapsed = this._root.getByRole('button', { name, disabled: false, expanded: false });
        this._toggleButtonExpanded = this._root.getByRole('button', { name, disabled: false, expanded: true });
        this._toggleContent = this._root.getByRole('grid');
    }

    static override getPairwiseLocators(list: Locator, item: [name: string, value: string]): readonly Locator[] {
        const row = list.getByRole('gridcell', { name: item[0], exact: true }).locator('..');
        return item.map(name => row.getByRole('gridcell', { name, exact: true }));
    }
}

export class DefaultPayoutBreakdown extends AbstractPayoutBreakdown {
    constructor(page: Page, name: PayoutBreakdownLabel) {
        super(page, name);

        this._root = page.getByRole('button', { name, exact: true }).locator('../..');
        this._toggleButton = this._root.getByRole('button', { name, exact: true, disabled: false });
        this._toggleButtonCollapsed = this._root.getByRole('button', { name, exact: true, disabled: false, expanded: false });
        this._toggleButtonExpanded = this._root.getByRole('button', { name, exact: true, disabled: false, expanded: true });
        this._toggleContent = this._root.getByRole('region', { name, exact: true });
    }

    static override getPairwiseLocators(list: Locator, item: [name: string, value: string]): readonly Locator[] {
        const listItem = list.locator('dt', { hasText: item[0] }).locator('..');
        return [listItem.locator('dt', { hasText: item[0] }), listItem.locator('dd', { hasText: item[1] })] as const;
    }
}
