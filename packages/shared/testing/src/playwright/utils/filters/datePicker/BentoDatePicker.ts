import type { Locator, Page } from '@playwright/test';
import type { DatePickerOptions, DateStruct, TodayRangeOptions } from './AbstractDatePicker';
import AbstractDatePicker from './AbstractDatePicker';

const defaultPresetButtonLocatorOptions = { name: 'Custom range', exact: true, disabled: false };

export default class BentoDatePicker extends AbstractDatePicker {
    constructor(scope: Page | Locator, options: Omit<DatePickerOptions, 'dynamicCustomPreset'>) {
        super({ ...options, dynamicCustomPreset: false });

        // [TODO]: Address misaligned ARIA labels and attributes for Bento filter components
        this._button = scope.getByRole('button', { name: /^Date range/, disabled: false });
        this._dialog = this._button.page().getByRole('dialog', { name: 'Date range', exact: true });
        this._applyButton = this._dialog.getByRole('button', { name: 'Apply', exact: true });
        this._resetButton = this._dialog.getByRole('button', { name: 'Reset', exact: true });

        this._presetButton = this._dialog.getByRole('combobox', defaultPresetButtonLocatorOptions);
        this._presetButtonCollapsed = this._dialog.getByRole('combobox', { ...defaultPresetButtonLocatorOptions, expanded: false });
        this._presetButtonExpanded = this._dialog.getByRole('combobox', { ...defaultPresetButtonLocatorOptions, expanded: true });
        this._presetDialog = this._dialog.getByRole('listbox', { name: 'Custom range', exact: true });

        this._presetCustom = this._presetDialog.getByRole('option', { name: /^Custom range/, disabled: false });
        this._presetSelected = this._presetDialog.getByRole('option', { disabled: false, selected: true });
        this._presetUnselected = this._presetDialog.getByRole('option', { disabled: false, selected: false });
    }

    protected override async _expectRange(range: string | RegExp) {
        await super._expectRange(range instanceof RegExp ? range : new RegExp(`${range}$`));
    }

    protected _getTodayDateString({ date, month, year }: DateStruct) {
        const shortMonth = month.slice(0, 3);
        const zeroPaddedDate = String(date).padStart(2, '0');
        return `${zeroPaddedDate} ${shortMonth}, ${year}`;
    }

    protected override _getTodayRangeFormatted(options: TodayRangeOptions) {
        const todayDateString = this._getTodayDateString(options.today);
        return `${todayDateString} - ${todayDateString}`;
    }

    protected override _getTodayTimestamps(options: TodayRangeOptions) {
        const todayDateString = this._getTodayDateString(options.today);
        const startTimestamp = new Date(`${todayDateString}, 12:00 AM`).getTime();
        const endTimestamp = Math.min(startTimestamp + 86_400_000 /* 24 hours in ms */, options.now ?? Date.now());
        return [startTimestamp, endTimestamp] as const;
    }
}
