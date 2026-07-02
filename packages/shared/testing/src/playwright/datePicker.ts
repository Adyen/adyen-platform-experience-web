import { expect, type Locator } from '@playwright/test';

export interface DatePickerHelpers {
    assertFilterButtonLabel: (filterButton: Locator, selection: string) => Promise<void>;
    chooseTodayDate: (datePicker: Locator) => Promise<void>;
    extractTodayDate: (datePicker: Locator) => Promise<Readonly<{ formattedDate: string; timestamps: readonly [number, number] }>>;
    getFilterButton: (datePicker: Locator) => Locator;
    getPresetSelectButton: (datePicker: Locator) => Locator;
    getPresetSelectDialog: (datePicker: Locator) => Locator;
}

const createDatePickerUtils = (helpers: DatePickerHelpers) => {
    const reset = async (datePicker: Locator, options: { defaultSelection: string }) => {
        await expect(datePicker).toBeVisible();

        const filterButton = helpers.getFilterButton(datePicker);

        // Reset the datepicker selection
        await datePicker.getByRole('button', { name: 'Reset', exact: true, disabled: false }).click();

        // Datepicker collapsed
        await helpers.assertFilterButtonLabel(filterButton, options.defaultSelection);
        await expect(datePicker).toBeHidden();
    };

    const selectPreset = async (datePicker: Locator, options: { selection: string }) => {
        await expect(datePicker).toBeVisible();

        const filterButton = helpers.getFilterButton(datePicker);
        const dateRangePresetSelectButton = helpers.getPresetSelectButton(datePicker);
        const dateRangePresetSelectDialog = helpers.getPresetSelectDialog(datePicker);

        const selectedPreset = options.selection;

        await dateRangePresetSelectButton.click();
        await expect(dateRangePresetSelectDialog).toBeVisible();
        await dateRangePresetSelectDialog.getByRole('option', { name: selectedPreset, exact: true }).click();

        // Date range preset select dialog collapsed
        await expect(dateRangePresetSelectButton).toHaveText(selectedPreset);
        await expect(dateRangePresetSelectDialog).toBeHidden();

        await datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();

        // Datepicker collapsed
        await helpers.assertFilterButtonLabel(filterButton, selectedPreset);
        await expect(datePicker).toBeHidden();
    };

    const selectTodayDate = async (datePicker: Locator) => {
        await expect(datePicker).toBeVisible();

        const filterButton = helpers.getFilterButton(datePicker);
        const dateRangePresetSelectButton = helpers.getPresetSelectButton(datePicker);

        // Select today's date from the calendar
        await helpers.chooseTodayDate(datePicker);
        await expect(dateRangePresetSelectButton).toHaveText(/^Custom/);

        const { formattedDate } = await helpers.extractTodayDate(datePicker);

        // Apply custom date range selection
        await datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();

        // Datepicker collapsed
        await helpers.assertFilterButtonLabel(filterButton, formattedDate);
        await expect(datePicker).toBeHidden();
    };

    return { ...helpers, reset, selectPreset, selectTodayDate } as const;
};

/* --------------------------------------------------------------- */
/* UI-PREACT DATE PICKER (TESTING UTILITIES)                       */
/* --------------------------------------------------------------- */
const assertDatePickerFilterButtonLabel = (filterButton: Locator, selection: string) => {
    return expect(filterButton).toHaveText(selection);
};

const getDatePickerFilterButton = (datePicker: Locator) => {
    return datePicker.page().getByRole('button', { name: 'Date range', exact: true, expanded: false });
};

const getDatePickerRangePresetSelectButton = (datePicker: Locator) => {
    return datePicker.getByRole('button', { name: 'Preset range select', exact: true, expanded: false });
};

const getDatePickerRangePresetSelectDialog = (datePicker: Locator) => {
    return datePicker.page().getByRole('dialog').nth(1);
};

const chooseTodayDateFromDatePicker = (datePicker: Locator) => {
    return datePicker.getByTestId('calendar-current-day').click();
};

const extractTodayDateFromDatePicker = async (datePicker: Locator) => {
    await expect(datePicker).toBeVisible();

    const monthAndYear = (await datePicker.getByTestId('calendar-month-name').textContent()) ?? '';
    const timezone = (await datePicker.getByTestId('date-picker-timezone').textContent()) ?? '';
    const date = (await datePicker.getByTestId('calendar-current-day').textContent()) ?? '';
    const month = monthAndYear.slice(0, 3);
    const year = monthAndYear.slice(-4);

    const formattedDate = `${month} ${date}, ${year}`;
    const startTimestamp = new Date(`${formattedDate}, 12:00 AM ${timezone.match(/(GMT\S+)\s/)?.[1] ?? ''}`).getTime();
    const endTimestamp = Math.min(startTimestamp + 86_400_000 /* 24 hours in ms */, Date.now() + 1 /* +1 to compensate for time shift */);

    return { formattedDate, timestamps: [startTimestamp, endTimestamp] } as const;
};

export const datePickerUtils = createDatePickerUtils({
    assertFilterButtonLabel: assertDatePickerFilterButtonLabel,
    chooseTodayDate: chooseTodayDateFromDatePicker,
    extractTodayDate: extractTodayDateFromDatePicker,
    getFilterButton: getDatePickerFilterButton,
    getPresetSelectButton: getDatePickerRangePresetSelectButton,
    getPresetSelectDialog: getDatePickerRangePresetSelectDialog,
});

/* --------------------------------------------------------------- */
/* BENTO DATE PICKER (TESTING UTILITIES)                           */
/* --------------------------------------------------------------- */
const assertBentoDatePickerFilterButtonLabel = (filterButton: Locator, selection: string) => {
    return expect(filterButton).toHaveText(new RegExp(`${selection}$`));
};

const getBentoDatePickerFilterButton = (datePicker: Locator) => {
    return datePicker.page().getByRole('button', { name: /^Date range/ });
};

const getBentoDatePickerRangePresetSelectButton = (datePicker: Locator) => {
    return datePicker.getByRole('combobox', { name: 'Custom range', exact: true, expanded: false });
};

const getBentoDatePickerRangePresetSelectDialog = (datePicker: Locator) => {
    return datePicker.page().getByRole('listbox', { name: 'Custom range', exact: true });
};

const chooseTodayDateFromBentoDatePicker = async (datePicker: Locator) => {
    const nextMonthButton = datePicker.getByRole('button', { name: 'Next month', exact: true, disabled: false });
    const prevMonthButton = datePicker.getByRole('button', { name: 'Previous month', exact: true, disabled: false });
    const firstDay = datePicker.getByRole('gridcell', { name: '1', exact: true, selected: true });
    const lastSelectedDay = datePicker.getByRole('gridcell', { selected: true }).last();

    while (true) {
        await nextMonthButton.click();

        if (!(await firstDay.isVisible())) {
            await prevMonthButton.click();

            // Last selected day is definitely today
            // Click 2 times to lock selection to today
            await lastSelectedDay.click();
            await lastSelectedDay.click();
            break;
        }
    }
};

const extractTodayDateFromBentoDatePicker = async (datePicker: Locator) => {
    await expect(datePicker).toBeVisible();

    const monthAndYear = (await datePicker.getByRole('heading').first().textContent()) ?? '';
    const date = (await datePicker.getByRole('gridcell', { selected: true }).last().textContent()) ?? '';
    const month = monthAndYear.slice(0, 3);
    const year = monthAndYear.slice(-4);

    const formattedDate = `${date} ${month}, ${year}`;
    const startTimestamp = new Date(`${formattedDate}, 12:00 AM`).getTime();
    const endTimestamp = Math.min(startTimestamp + 86_400_000 /* 24 hours in ms */, Date.now());

    return { formattedDate: `${formattedDate} - ${formattedDate}`, timestamps: [startTimestamp, endTimestamp] } as const;
};

export const bentoDatePickerUtils = createDatePickerUtils({
    assertFilterButtonLabel: assertBentoDatePickerFilterButtonLabel,
    chooseTodayDate: chooseTodayDateFromBentoDatePicker,
    extractTodayDate: extractTodayDateFromBentoDatePicker,
    getFilterButton: getBentoDatePickerFilterButton,
    getPresetSelectButton: getBentoDatePickerRangePresetSelectButton,
    getPresetSelectDialog: getBentoDatePickerRangePresetSelectDialog,
});
