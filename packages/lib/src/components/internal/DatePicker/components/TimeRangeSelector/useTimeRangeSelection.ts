import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import type { TranslationKey } from '@src/core/Localization/types';
import { RangeTimestamp, RangeTimestamps } from '@src/components/internal/Calendar/calendar/timerange';
import * as RangePreset from '@src/components/internal/Calendar/calendar/timerange/presets';

export type UseTimeRangeSelectionConfig = {
    options?: Readonly<{ [key: string]: RangeTimestamps }>;
    selectedOption?: string;
    now: RangeTimestamp;
};

export type UseTimeRangeSelectionData = ReturnType<typeof useTimeRangeSelection>;

export const TIME_RANGE_PRESET_OPTIONS = {
    'rangePreset.last7Days': RangePreset.lastNDays(7),
    'rangePreset.thisWeek': RangePreset.thisWeek(),
    'rangePreset.lastWeek': RangePreset.lastWeek(),
    'rangePreset.thisMonth': RangePreset.thisMonth(),
    'rangePreset.lastMonth': RangePreset.lastMonth(),
    'rangePreset.yearToDate': RangePreset.yearToDate(),
} as const;

export const useTimeRangeSelection = ({
    now,
    selectedOption: selectedPresetOption,
    options: presetOptions = TIME_RANGE_PRESET_OPTIONS,
}: UseTimeRangeSelectionConfig) => {
    const { i18n } = useCoreContext();
    const [from, setFrom] = useState<string>();
    const [to, setTo] = useState<string>();
    const [selectedOption, setSelectedOption] = useState<string>();
    const NOW = useRef<typeof now>();

    const [customOption, getRangesForOption, selectionOptions] = useMemo(() => {
        const customOption = i18n.get('rangePreset.custom');
        const optionKeys = Object.keys(presetOptions);
        const selectionOptions = Object.freeze(optionKeys.map(key => i18n.get(key as TranslationKey)));

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

            setFrom(i18n.fullDate(ranges.from));
            setTo(i18n.fullDate(ranges.to));
            setIsCustomSelection(false);
            setSelectedOption(option);
        },
        [i18n, customOption, getRangesForOption, selectedOption, selectionOptions]
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
        if (NOW.current !== now) {
            NOW.current = now;
            Object.values(presetOptions).forEach(ranges => (ranges.now = now));
            onSelection(selectedOption!);
        }
    }, [now]);

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
