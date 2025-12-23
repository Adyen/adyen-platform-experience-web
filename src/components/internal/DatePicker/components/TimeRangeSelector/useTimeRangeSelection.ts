import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import type { RestampContext } from '../../../../../core/Localization/datetime/restamper';
import type { TranslationKey } from '../../../../../translations';
import { RangeTimestamp, RangeTimestamps } from '../../../Calendar/calendar/timerange';
import * as RangePreset from '../../../Calendar/calendar/timerange/presets';

export type TimeRangeOptions = 'last7Days' | 'last30Days' | 'last90Days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'yearToDate';

export type UseTimeRangeSelectionConfig = {
    now?: RangeTimestamp;
    options: Readonly<Partial<{ [P in TimeRangeOptions as `common.filters.types.date.rangeSelect.options.${P}`]: RangeTimestamps }>>;
    selectedOption?: string;
    timezone?: RestampContext['TIMEZONE'];
};

export type UseTimeRangeSelectionData = ReturnType<typeof useTimeRangeSelection>;

export const getTimeRangeSelectionDefaultPresetOptions = (): Required<UseTimeRangeSelectionConfig['options']> =>
    Object.freeze({
        'common.filters.types.date.rangeSelect.options.last7Days': RangePreset.lastNDays(7),
        'common.filters.types.date.rangeSelect.options.last30Days': RangePreset.lastNDays(30),
        'common.filters.types.date.rangeSelect.options.last90Days': RangePreset.lastNDays(90),
        'common.filters.types.date.rangeSelect.options.thisWeek': RangePreset.thisWeek(),
        'common.filters.types.date.rangeSelect.options.lastWeek': RangePreset.lastWeek(),
        'common.filters.types.date.rangeSelect.options.thisMonth': RangePreset.thisMonth(),
        'common.filters.types.date.rangeSelect.options.lastMonth': RangePreset.lastMonth(),
        'common.filters.types.date.rangeSelect.options.yearToDate': RangePreset.yearToDate(),
    }) satisfies Readonly<Partial<Record<TranslationKey, RangeTimestamps>>>;

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
