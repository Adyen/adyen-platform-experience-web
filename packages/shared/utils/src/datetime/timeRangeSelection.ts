import {
    TIME_RANGE_SELECTION_PRESET_OPTION_KEYS,
    type TimeRangeSelectionOptions,
    type TimeRangeSelectionPresetOptionKey,
} from '@integration-components/types';

type TimeRangeSelectionPresetFactories<RangeTimestamps> = {
    lastNDays: (numberOfDays: number) => RangeTimestamps;
    lastWeek: () => RangeTimestamps;
    thisWeek: () => RangeTimestamps;
    lastMonth: () => RangeTimestamps;
    thisMonth: () => RangeTimestamps;
    yearToDate: () => RangeTimestamps;
};

export const getTimeRangeSelectionDefaultPresetOptions = <RangeTimestamps>(
    factories: TimeRangeSelectionPresetFactories<RangeTimestamps>,
    { exclude = [] }: { exclude?: TimeRangeSelectionPresetOptionKey[] } = {}
): TimeRangeSelectionOptions<RangeTimestamps> => {
    const allOptions: TimeRangeSelectionOptions<RangeTimestamps> = {
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_7_DAYS]: factories.lastNDays(7),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_30_DAYS]: factories.lastNDays(30),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_90_DAYS]: factories.lastNDays(90),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.THIS_WEEK]: factories.thisWeek(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_WEEK]: factories.lastWeek(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.THIS_MONTH]: factories.thisMonth(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_MONTH]: factories.lastMonth(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.YEAR_TO_DATE]: factories.yearToDate(),
    };

    if (!exclude.length) return Object.freeze(allOptions);

    const excludeSet = new Set(exclude);
    return Object.freeze(
        Object.fromEntries(Object.entries(allOptions).filter(([key]) => !excludeSet.has(key as TimeRangeSelectionPresetOptionKey)))
    ) as TimeRangeSelectionOptions<RangeTimestamps>;
};
