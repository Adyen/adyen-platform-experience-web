import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { DatePickerOptions, DateStruct, TodayRangeOptions } from './AbstractDatePicker';
import AbstractDatePicker from './AbstractDatePicker';

const defaultButtonLocatorOptions = { name: 'Date range', exact: true, disabled: false };
const defaultPresetButtonLocatorOptions = { name: 'Preset range select', exact: true, disabled: false };

export default class DefaultDatePicker extends AbstractDatePicker {
    private readonly _buttonCollapsed!: Locator;
    private readonly _buttonExpanded!: Locator;

    constructor(scope: Page | Locator, options: Omit<DatePickerOptions, 'dynamicCustomPreset'>) {
        super({ ...options, dynamicCustomPreset: true });

        this._button = scope.getByRole('button', defaultButtonLocatorOptions);
        this._buttonCollapsed = scope.getByRole('button', { ...defaultButtonLocatorOptions, expanded: false });
        this._buttonExpanded = scope.getByRole('button', { ...defaultButtonLocatorOptions, expanded: true });
        this._dialog = this._button.page().getByRole('dialog', { name: 'Date range', exact: true });

        this._timezoneInfo = this._dialog.getByTestId('date-picker-timezone');
        this._applyButton = this._dialog.getByRole('button', { name: 'Apply', exact: true });
        this._resetButton = this._dialog.getByRole('button', { name: 'Reset', exact: true });

        this._presetButton = this._dialog.getByRole('button', defaultPresetButtonLocatorOptions);
        this._presetButtonCollapsed = this._dialog.getByRole('button', { ...defaultPresetButtonLocatorOptions, expanded: false });
        this._presetButtonExpanded = this._dialog.getByRole('button', { ...defaultPresetButtonLocatorOptions, expanded: true });
        this._presetDialog = this._presetButton.page().getByRole('dialog', { name: 'Preset range select', exact: true });

        this._presetCustom = this._presetDialog.getByRole('option', { name: 'Custom', exact: true, disabled: false });
        this._presetSelected = this._presetDialog.getByRole('option', { disabled: false, selected: true });
        this._presetUnselected = this._presetDialog.getByRole('option', { disabled: false, selected: false });
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
            this._buttonCollapsed.waitFor({ state: 'visible', timeout: 100 }),
            this._buttonExpanded.waitFor({ state: 'hidden', timeout: 100 }),
        ]).catch(() => {});

        // prettier-ignore
        return await super._isExpanded()
            && await this._buttonCollapsed.isHidden()
            && await this._buttonExpanded.isVisible();
    }

    protected _getTodayDateString({ date, month, year }: DateStruct) {
        const shortMonth = month.slice(0, 3);
        return `${shortMonth} ${date}, ${year}`;
    }

    protected override async _getTodayRangeFormatted(options: TodayRangeOptions) {
        return this._getTodayDateString(options.today);
    }

    protected override async _getTodayTimestamps(options: TodayRangeOptions) {
        const todayDateString = this._getTodayDateString(options.today);
        const startTimestamp = new Date(`${todayDateString}, 12:00 AM ${options.timezone ?? ''}`).getTime();
        const endTimestamp = Math.min(startTimestamp + 86_400_000 /* 24 hours in ms */, options.now ?? Date.now());
        return [startTimestamp, endTimestamp] as const;
    }
}
