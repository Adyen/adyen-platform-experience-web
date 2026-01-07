import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import type { RestampContext } from '../../../../../core/Localization/datetime/restamper';
import type { TranslationKey } from '../../../../../translations';
import { RangeTimestamp, RangeTimestamps } from '../../../Calendar/calendar/timerange';
import * as RangePreset from '../../../Calendar/calendar/timerange/presets';

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

export type UseTimeRangeSelectionConfig = {
    clearable?: boolean;
    now?: RangeTimestamp;
    options: Readonly<Partial<{ [P in TimeRangeOptions as `common.filters.types.date.rangeSelect.options.${P}`]: RangeTimestamps }>>;
    selectedOption?: string;
    timezone?: RestampContext['TIMEZONE'];
};

export type UseTimeRangeSelectionData = ReturnType<typeof useTimeRangeSelection>;

export const getTimeRangeSelectionDefaultPresetOptions = ({
    exclude = [],
}: { exclude?: TimeRangeSelectionPresetOptionKey[] } = {}): UseTimeRangeSelectionConfig['options'] => {
    const allOptions = {
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_7_DAYS]: RangePreset.lastNDays(7),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_30_DAYS]: RangePreset.lastNDays(30),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_90_DAYS]: RangePreset.lastNDays(90),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.THIS_WEEK]: RangePreset.thisWeek(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_WEEK]: RangePreset.lastWeek(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.THIS_MONTH]: RangePreset.thisMonth(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_MONTH]: RangePreset.lastMonth(),
        [TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.YEAR_TO_DATE]: RangePreset.yearToDate(),
    } satisfies Readonly<Partial<Record<TranslationKey, RangeTimestamps>>>;

    if (!exclude?.length) return Object.freeze(allOptions) as UseTimeRangeSelectionConfig['options'];

    const excludeSet = new Set(exclude);
    return Object.freeze(
        Object.fromEntries(Object.entries(allOptions).filter(([key]) => !excludeSet.has(key as TimeRangeSelectionPresetOptionKey)))
    ) as UseTimeRangeSelectionConfig['options'];
};

export const useTimeRangeSelection = ({
    now = Date.now(),
    options: presetOptions,
    selectedOption: selectedPresetOption,
    timezone,
}: UseTimeRangeSelectionConfig) => {
    const { i18n } = useCoreContext();
    const [from, setFrom] = useState<number>();
    const [to, setTo] = useState<number>();
    const [selectedOption, setSelectedOption] = useState<string>();
    const NOW = useRef<typeof now>();
    const TZ = useRef<typeof timezone>();

    const [customOption, getRangesForOption, selectionOptions] = useMemo(() => {
        const customOption = i18n.get('common.filters.types.date.rangeSelect.options.custom');
        const optionKeys = Object.keys(presetOptions) as TranslationKey[];
        const selectionOptions = Object.freeze(optionKeys.map(key => i18n.get(key)));

        const getRangesForOption = (option: string, options: readonly string[] = selectionOptions) => {
            const optionIndex = options.findIndex(currentOption => currentOption === option);
            return presetOptions[optionKeys[optionIndex] as keyof typeof presetOptions];
        };

        return [customOption, getRangesForOption, selectionOptions] as const;
    }, [i18n, presetOptions]);

    const [isCustomSelection, setIsCustomSelection] = useState(selectedPresetOption === customOption);
    const selectionOptionsWithCustomOption = useMemo(() => Object.freeze([...selectionOptions, customOption]), [customOption, selectionOptions]);

    const options = useMemo(
        () => (isCustomSelection ? selectionOptionsWithCustomOption : selectionOptions),
        [isCustomSelection, selectionOptions, selectionOptionsWithCustomOption]
    );

    const onSelection = useCallback(
        (option: string) => {
            const ranges = getRangesForOption(option, selectionOptions);
            if (!ranges) return;

            setFrom(ranges.from);
            setTo(ranges.to);
            setIsCustomSelection(false);
            setSelectedOption(option);
        },
        [customOption, getRangesForOption, selectedOption, selectionOptions]
    );

    const customSelection = useCallback(() => {
        setFrom(undefined);
        setTo(undefined);
        setIsCustomSelection(true);
        setSelectedOption(customOption);
    }, [customOption]);

    useMemo(() => {
        selectedPresetOption === customOption ? setSelectedOption(customOption) : onSelection(selectedPresetOption!);
    }, []);

    useMemo(() => {
        if (NOW.current !== now || TZ.current !== timezone) {
            const options = Object.values(presetOptions);

            options.forEach(ranges => {
                ranges.now = now;
                ranges.timezone = timezone;
            });

            NOW.current = now;
            TZ.current = options[0]?.timezone;

            onSelection(selectedOption!);
        }
    }, [now, timezone, presetOptions]);

    return {
        customSelection,
        from,
        onSelection,
        options,
        selectedOption,
        to,
    } as const;
};

export default useTimeRangeSelection;
