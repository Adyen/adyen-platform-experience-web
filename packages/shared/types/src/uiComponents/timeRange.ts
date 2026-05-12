export type TimeRangeOptions = 'last7Days' | 'last30Days' | 'last90Days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'yearToDate';

export const TIME_RANGE_SELECTION_PRESET_OPTION_KEYS = Object.freeze({
    LAST_7_DAYS: 'common.filters.types.date.rangeSelect.options.last7Days',
    LAST_30_DAYS: 'common.filters.types.date.rangeSelect.options.last30Days',
    LAST_90_DAYS: 'common.filters.types.date.rangeSelect.options.last90Days',
    THIS_WEEK: 'common.filters.types.date.rangeSelect.options.thisWeek',
    LAST_WEEK: 'common.filters.types.date.rangeSelect.options.lastWeek',
    THIS_MONTH: 'common.filters.types.date.rangeSelect.options.thisMonth',
    LAST_MONTH: 'common.filters.types.date.rangeSelect.options.lastMonth',
    YEAR_TO_DATE: 'common.filters.types.date.rangeSelect.options.yearToDate',
} as const);

export type TimeRangeSelectionPresetOptionKey =
    (typeof TIME_RANGE_SELECTION_PRESET_OPTION_KEYS)[keyof typeof TIME_RANGE_SELECTION_PRESET_OPTION_KEYS];

export type TimeRangeSelectionOptions<RangeTimestamps> = Readonly<
    Partial<{ [P in TimeRangeOptions as `common.filters.types.date.rangeSelect.options.${P}`]: RangeTimestamps }>
>;

export type UseTimeRangeSelectionConfig<RangeTimestamps = unknown, Timezone = unknown, RangeTimestamp = number> = {
    clearable?: boolean;
    now?: RangeTimestamp;
    options: TimeRangeSelectionOptions<RangeTimestamps>;
    selectedOption?: string;
    timezone?: Timezone;
};
