import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

const CALENDAR_MONTH_REGEX = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+$/;
const SHORT_MONTH_REGEX = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/;

export interface DatePickerOptions {
    readonly defaultPreset: string;
    readonly dynamicCustomPreset?: boolean;
}

export interface DateStruct {
    readonly date: number;
    readonly month: string;
    readonly year: number;
}

export interface TodayRangeOptions {
    readonly today: DateStruct;
    readonly timezone?: string;
    readonly now?: number;
}

export type Timestamps = readonly [from: number, to: number];

export default abstract class AbstractDatePicker {
    protected _button!: Locator;
    protected _dialog!: Locator;
    protected _presetButton!: Locator;
    protected _presetButtonCollapsed!: Locator;
    protected _presetButtonExpanded!: Locator;
    protected _presetDialog!: Locator;
    protected _presetCustom!: Locator;
    protected _presetSelected!: Locator;
    protected _presetUnselected!: Locator;
    protected _timezoneInfo?: Locator;
    protected _applyButton!: Locator;
    protected _resetButton!: Locator;

    protected abstract _getTodayRangeFormatted(options: TodayRangeOptions): Promise<string> | string;
    protected abstract _getTodayTimestamps(options: TodayRangeOptions): Promise<Timestamps> | Timestamps;

    protected constructor(readonly options: DatePickerOptions) {}

    protected async _expectActionButtons() {
        await expect(this._applyButton).toBeVisible();
        await expect(this._resetButton).toBeVisible();
    }

    protected async _expectCollapsed() {
        await expect(this._dialog).toBeHidden();
    }

    protected async _expectExpanded() {
        await expect(this._dialog).toBeVisible();
        await this._expectActionButtons();
    }

    protected async _expectPresetCollapsed() {
        await expect(this._presetDialog).toBeHidden();
        await expect(this._presetButtonCollapsed).toBeVisible();
        await expect(this._presetButtonExpanded).toBeHidden();
    }

    protected async _expectPresetExpanded() {
        await expect(this._presetDialog).toBeVisible();
        await expect(this._presetButtonCollapsed).toBeHidden();
        await expect(this._presetButtonExpanded).toBeVisible();
    }

    protected async _isCollapsed() {
        await this._dialog.waitFor({ state: 'hidden', timeout: 100 });
        return this._dialog.isHidden();
    }

    protected async _isExpanded() {
        await Promise.all([
            this._dialog.waitFor({ state: 'visible', timeout: 100 }),
            this._applyButton.waitFor({ state: 'visible', timeout: 100 }),
            this._resetButton.waitFor({ state: 'visible', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await this._dialog.isVisible()
            && await this._applyButton.isVisible()
            && await this._resetButton.isVisible();
    }

    protected async _isPresetCollapsed() {
        await Promise.all([
            this._presetDialog.waitFor({ state: 'hidden', timeout: 100 }),
            this._presetButtonCollapsed.waitFor({ state: 'visible', timeout: 100 }),
            this._presetButtonExpanded.waitFor({ state: 'hidden', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await this._presetDialog.isHidden()
            && await this._presetButtonCollapsed.isVisible()
            && await this._presetButtonExpanded.isHidden();
    }

    protected async _isPresetExpanded() {
        await Promise.all([
            this._presetDialog.waitFor({ state: 'visible', timeout: 100 }),
            this._presetButtonCollapsed.waitFor({ state: 'hidden', timeout: 100 }),
            this._presetButtonExpanded.waitFor({ state: 'visible', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await this._presetDialog.isVisible()
            && await this._presetButtonCollapsed.isHidden()
            && await this._presetButtonExpanded.isVisible();
    }

    protected async _expectPresetCustom() {
        if (await this._isPresetExpanded()) {
            await expect(this._presetCustom).toBeVisible();
            await expect(this._presetSelected).toBeVisible();
            await expect(this._presetSelected).toHaveText(/^Custom/);
        }
        if (await this._isPresetCollapsed()) {
            await expect(this._presetCustom).toBeHidden();
            await expect(this._presetSelected).toBeHidden();
        }
        await expect(this._presetButton).toHaveText(/^Custom/);
    }

    protected async _expectPresetSelected(preset: string) {
        if (await this._isPresetExpanded()) {
            const visibility = this.options.dynamicCustomPreset ? 'toBeHidden' : 'toBeVisible';
            await expect(this._presetCustom)[visibility]();
            await expect(this._presetSelected).toBeVisible();
            await expect(this._presetSelected).toHaveText(new RegExp(`^${preset}`));
        }
        if (await this._isPresetCollapsed()) {
            await expect(this._presetCustom).toBeHidden();
            await expect(this._presetSelected).toBeHidden();
        }
        await expect(this._presetButton).toHaveText(new RegExp(`^${preset}$`));
    }

    protected async _expectRange(range: string | RegExp) {
        await expect(this._button).toHaveText(range);
    }

    protected async _selectToday(): Promise<DateStruct> {
        const nextMonthButton = this._dialog.getByRole('button', { name: 'Next month', exact: true, disabled: false });
        const prevMonthButton = this._dialog.getByRole('button', { name: 'Previous month', exact: true, disabled: false });
        const lastSelectedDay = this._dialog.getByRole('gridcell', { selected: true }).last();

        while (true) {
            if (await nextMonthButton.isVisible()) {
                await nextMonthButton.click();

                if (await lastSelectedDay.isHidden()) {
                    await prevMonthButton.click();
                    break;
                }
            } else break;
        }

        // Last selected day is definitely today
        const date = Number((await lastSelectedDay.textContent()) ?? '');
        const monthAndYear = (await this._dialog.getByText(CALENDAR_MONTH_REGEX).textContent()) ?? '';
        const month = monthAndYear.slice(0, -5);
        const year = Number(monthAndYear.slice(-4));

        // Click twice to lock selection to today
        await lastSelectedDay.click();
        await lastSelectedDay.click();

        return { date, month, year } as const;
    }

    protected async _apply() {
        await this._expectExpanded();
        await expect(this._applyButton).toBeVisible();
        await expect(this._applyButton).toBeEnabled();
        await this._applyButton.click();
        await this._expectCollapsed();
    }

    get button() {
        return this._button;
    }

    get dialog() {
        return this._dialog;
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

    async collapsePreset(mode?: 'clickButton' | 'clickOutside') {
        await this._expectExpanded();

        if (mode) await this._expectPresetExpanded();

        if (await this._isPresetExpanded()) {
            switch (mode) {
                case 'clickOutside':
                    await this._dialog.click({ position: { x: 0, y: 0 } });
                    break;

                case 'clickButton':
                default:
                    await this._presetButton.click();
                    break;
            }
        }

        await this._expectPresetCollapsed();
    }

    async expandPreset(mode?: 'clickButton') {
        await this._expectExpanded();

        if (mode) await this._expectPresetCollapsed();

        if (await this._isPresetCollapsed()) {
            switch (mode) {
                case 'clickButton':
                default:
                    await this._presetButton.click();
                    break;
            }
        }

        await this._expectPresetExpanded();
    }

    async expectCustomRange() {
        const wasCollapsed = await this._isCollapsed();
        await this.expand();

        const wasPresetCollapsed = await this._isPresetCollapsed();
        await this.expandPreset();
        await this._expectPresetCustom();

        if (wasPresetCollapsed) {
            await this.collapsePreset();
        }

        if (wasCollapsed) {
            await this.collapse();
            await this._expectRange(SHORT_MONTH_REGEX);
        }
    }

    async expectPresetRange(preset: string) {
        const wasCollapsed = await this._isCollapsed();
        await this.expand();

        const wasPresetCollapsed = await this._isPresetCollapsed();
        await this.expandPreset();
        await this._expectPresetSelected(preset);

        if (wasPresetCollapsed) {
            await this.collapsePreset();
        }

        if (wasCollapsed) {
            await this.collapse();
            await this._expectRange(preset);
        }
    }

    async expectActionButtons(buttons: { [k in 'apply' | 'reset']?: 'disabled' | 'enabled' } = {}): Promise<void> {
        await this._expectExpanded();

        for (const entry of Object.entries(buttons)) {
            let actionButton: Locator | undefined;
            const button = entry[0] as 'apply' | 'reset';
            const state = entry[1];

            switch (button) {
                case 'apply':
                    actionButton = this._applyButton;
                    break;
                case 'reset':
                    actionButton = this._resetButton;
                    break;
                default:
                    throw new Error(`Unexpected button: ${button}`);
            }

            switch (state) {
                case 'disabled':
                    await expect(actionButton).toBeDisabled();
                    break;
                case 'enabled':
                    await expect(actionButton).toBeEnabled();
                    break;
                default:
                    throw new Error(`Unexpected state: ${state}`);
            }
        }
    }

    async selectUnselectedPreset(preset: string, options?: { apply?: boolean }) {
        await this.expand();
        await this.expandPreset();

        await this._presetUnselected.filter({ hasText: preset }).click();
        await this._expectPresetCollapsed();
        await this._expectPresetSelected(preset);

        const shouldApplySelection = options?.apply !== false;

        if (shouldApplySelection) {
            await this._apply();
            await this._expectRange(preset);
        }

        return preset;
    }

    async selectToday(options?: { apply?: boolean; now?: number }): Promise<Timestamps> {
        await this.expand();

        const timezone = (await this._timezoneInfo?.textContent())?.match(/(GMT\S+)\s/)?.[1] ?? undefined;
        const today = await this._selectToday();
        await this._expectPresetCustom();

        const now = options?.now ?? Date.now();
        const shouldApplySelection = options?.apply !== false;
        const todayRangeOptions = { today, timezone, now } as const;

        if (shouldApplySelection) {
            await this._apply();
            await this._expectRange(await this._getTodayRangeFormatted(todayRangeOptions));
        }

        return this._getTodayTimestamps(todayRangeOptions);
    }

    async reset() {
        await this.expand();

        await expect(this._resetButton).toBeVisible();
        await expect(this._resetButton).toBeEnabled();
        await this._resetButton.click();
        await this._expectCollapsed();

        const { defaultPreset } = this.options;
        await this._expectRange(defaultPreset);
        return defaultPreset;
    }
}
