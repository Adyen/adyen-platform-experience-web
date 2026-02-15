import { expect, type Locator } from '@playwright/test';

export const extractTodayDateFromDatePicker = async (datePicker: Locator) => {
    await expect(datePicker).toBeVisible();

    const monthAndYear = (await datePicker.locator('.adyen-pe-calendar__month-name').textContent()) ?? '';
    const timezone = (await datePicker.locator('.adyen-pe-datepicker__timezone').textContent()) ?? '';
    const date = (await datePicker.locator(`[data-today='1']`).textContent()) ?? '';
    const month = monthAndYear.slice(0, 3);
    const year = monthAndYear.slice(-4);

    const formattedDate = `${month} ${date}, ${year}`;
    const startTimestamp = new Date(`${formattedDate}, 12:00 AM ${timezone.match(/(GMT\S+)\s/)?.[1] ?? ''}`).getTime();
    const endTimestamp = Math.min(startTimestamp + 86_400_000 /* 24 hours in ms */, Date.now() + 1 /* +1 to compensate for time shift */);

    return { formattedDate, timestamps: [startTimestamp, endTimestamp] } as const;
};

export const selectTodayDateFromDatePicker = async (datePicker: Locator) => {
    await expect(datePicker).toBeVisible();

    const filterButton = datePicker.page().getByRole('button', { name: 'Date range', exact: true, expanded: false });
    const dateRangePresetSelectButton = datePicker.getByRole('button', { name: 'Preset range select', exact: true, expanded: false });
    const today = await extractTodayDateFromDatePicker(datePicker);

    // Select today's date from the calendar
    await datePicker.locator(`[data-today='1']`).click();
    await expect(dateRangePresetSelectButton).toHaveText('Custom');

    // Apply custom date range selection
    await datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();

    await Promise.all([
        // Datepicker collapsed
        expect(filterButton).toHaveText(today.formattedDate),
        expect(datePicker).toBeHidden(),
    ]);
};

export const selectDateRangeResetFromDatePicker = async (datePicker: Locator, options: { selection: string }) => {
    await expect(datePicker).toBeVisible();

    const filterButton = datePicker.page().getByRole('button', { name: 'Date range', exact: true, expanded: false });
    const dateRangePresetSelectButton = datePicker.getByRole('button', { name: 'Preset range select', exact: true, expanded: false });
    const dateRangePresetSelectDialog = datePicker.page().getByRole('dialog').nth(1);

    const selectedPreset = options.selection;

    await dateRangePresetSelectButton.click();
    await expect(dateRangePresetSelectDialog).toBeVisible();
    await dateRangePresetSelectDialog.getByRole('option', { name: selectedPreset, exact: true }).click();

    await Promise.all([
        // Date range preset select dialog collapsed
        expect(dateRangePresetSelectButton).toHaveText(selectedPreset),
        expect(dateRangePresetSelectDialog).toBeHidden(),
    ]);

    await datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();

    await Promise.all([
        // Datepicker collapsed
        expect(filterButton).toHaveText(selectedPreset),
        expect(datePicker).toBeHidden(),
    ]);
};

export const resetDatePicker = async (datePicker: Locator, options: { defaultSelection: string }) => {
    await expect(datePicker).toBeVisible();

    const filterButton = datePicker.page().getByRole('button', { name: 'Date range', exact: true, expanded: false });

    // Reset the datepicker selection
    await datePicker.getByRole('button', { name: 'Reset', exact: true, disabled: false }).click();

    await Promise.all([
        // Datepicker collapsed
        expect(filterButton).toHaveText(options.defaultSelection),
        expect(datePicker).toBeHidden(),
    ]);
};
