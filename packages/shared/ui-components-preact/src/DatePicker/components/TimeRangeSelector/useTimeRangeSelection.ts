import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import type { RestampContext } from '@integration-components/utils/datetime/restamper';
import type { TranslationKey } from '@integration-components/core';
import { getTimeRangeSelectionDefaultPresetOptions as createDefaultPresetOptions } from '@integration-components/utils/datetime/timeRangeSelection';
import {
    type TimeRangeSelectionPresetOptionKey,
    type UseTimeRangeSelectionConfig as BaseUseTimeRangeSelectionConfig,
} from '@integration-components/types';
import type { RangeTimestamp, RangeTimestamps } from '../../../Calendar/calendar/timerange';
import * as RangePreset from '../../../Calendar/calendar/timerange/presets';

export type UseTimeRangeSelectionConfig = BaseUseTimeRangeSelectionConfig<RangeTimestamps, RestampContext['TIMEZONE'], RangeTimestamp>;

export type UseTimeRangeSelectionData = ReturnType<typeof useTimeRangeSelection>;

export const getTimeRangeSelectionDefaultPresetOptions = ({
    exclude = [],
}: { exclude?: TimeRangeSelectionPresetOptionKey[] } = {}): UseTimeRangeSelectionConfig['options'] =>
    createDefaultPresetOptions<RangeTimestamps>(
        {
            lastNDays: RangePreset.lastNDays,
            thisWeek: RangePreset.thisWeek,
            lastWeek: RangePreset.lastWeek,
            thisMonth: RangePreset.thisMonth,
            lastMonth: RangePreset.lastMonth,
            yearToDate: RangePreset.yearToDate,
        },
        { exclude }
    ) as UseTimeRangeSelectionConfig['options'];

export const useTimeRangeSelection = ({
    now,
    options: presetOptions,
    selectedOption: selectedPresetOption,
    timezone,
}: UseTimeRangeSelectionConfig) => {
    const { i18n } = useCoreContext();
    const [from, setFrom] = useState<number>();
    const [to, setTo] = useState<number>();
    const [selectedOption, setSelectedOption] = useState<string>();
    const NOWRef = useRef<typeof now>();
    const TZRef = useRef<typeof timezone>();

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
        [getRangesForOption, selectionOptions]
    );

    const customSelection = useCallback(() => {
        setFrom(undefined);
        setTo(undefined);
        setIsCustomSelection(true);
        setSelectedOption(customOption);
    }, [customOption]);

    useMemo(() => {
        if (selectedPresetOption === customOption) {
            setSelectedOption(customOption);
        } else {
            onSelection(selectedPresetOption!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useMemo(() => {
        if (NOWRef.current !== now || TZRef.current !== timezone) {
            const options = Object.values(presetOptions);

            options.forEach(ranges => {
                ranges.now = now ?? null;
                ranges.timezone = timezone;
            });

            NOWRef.current = now;
            TZRef.current = options[0]?.timezone;

            onSelection(selectedOption!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
