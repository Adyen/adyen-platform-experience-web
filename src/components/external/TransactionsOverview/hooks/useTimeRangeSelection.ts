import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { selectionOptionsFor } from '../components/MultiSelectionFilter';
import { RangeTimestamps } from '../../../internal/Calendar/calendar/timerange';
import { EMPTY_OBJECT } from '../../../../utils';

export interface UseTimeRangeSelectionProps<Option extends string> {
    currentOption?: Option;
    customOption: Option;
    defaultOption?: Option;
    mapOptionName?: (option: Option) => string | undefined;
    onRangeSelection?: (option: Option, range: RangeTimestamps) => void;
    ranges?: Readonly<Partial<Record<Option, RangeTimestamps>>>;
}

// [TODO]: Move range timestamps computation here (away from DatePicker)
const useTimeRangeSelection = <Option extends string>({
    currentOption,
    customOption,
    defaultOption,
    mapOptionName,
    onRangeSelection,
    ranges,
}: UseTimeRangeSelectionProps<Option>) => {
    const [range, setRange] = useState<RangeTimestamps>();

    const setSelectionRange = useCallback((range?: RangeTimestamps) => {
        setRange(currentRange => range ?? { ...(currentRange ?? (EMPTY_OBJECT as RangeTimestamps)) });
    }, []);

    const rangesWithoutCustomOption = useMemo(() => {
        if (ranges) {
            const entries = Object.entries(ranges).filter(([option, range]) => range && option !== customOption);
            const rangesWithoutCustomOption = Object.fromEntries(entries) as Record<Option, RangeTimestamps>;
            return Object.freeze(rangesWithoutCustomOption);
        }
    }, [customOption, ranges]);

    const computeSelection = useCallback(
        (...prioritizedSelectionCandidates: (Option | undefined)[]) => {
            if (rangesWithoutCustomOption) {
                const entries = Object.entries(rangesWithoutCustomOption) as [Option, RangeTimestamps][];

                for (const selection of prioritizedSelectionCandidates.filter(Boolean)) {
                    if (selection === customOption) break;
                    const range = entries.find(([option]) => selection === option)?.[1];
                    for (const [option, optionRange] of entries) {
                        if (range === optionRange) return option;
                    }
                }
            }
            return customOption;
        },
        [customOption, rangesWithoutCustomOption]
    );

    const selectionOptions = useMemo(() => {
        const options = [...Object.keys(rangesWithoutCustomOption ?? EMPTY_OBJECT), customOption] as Option[];
        return selectionOptionsFor(options, mapOptionName);
    }, [customOption, mapOptionName, rangesWithoutCustomOption]);

    const defaultSelection = useMemo(() => computeSelection(defaultOption), [computeSelection, defaultOption]);
    const externalSelection = useMemo(() => computeSelection(currentOption, defaultOption), [computeSelection, currentOption, defaultOption]);
    const cachedExternalSelection = useRef(externalSelection);

    const [selection, setSelection] = useState(externalSelection);

    const customSelection = useCallback(
        (range?: RangeTimestamps) => {
            setSelectionRange(range);
            setSelection(customOption);
            return customOption;
        },
        [customOption, setSelectionRange]
    );

    const updateSelection = useCallback(
        (selection: Option) => {
            setSelectionRange(rangesWithoutCustomOption?.[selection]);
            setSelection(selection);
            return selection;
        },
        [rangesWithoutCustomOption, setSelectionRange]
    );

    const resetSelection = useCallback(() => updateSelection(defaultSelection), [defaultSelection, updateSelection]);

    const onSelectionChanged = useCallback(
        ({ target }: any) => {
            const selection = target?.value as Option;
            updateSelection(selection);
            // onRangeSelection?.(selection, cachedRange.current);
        },
        [onRangeSelection, updateSelection]
    );

    if (cachedExternalSelection.current !== externalSelection) {
        cachedExternalSelection.current = externalSelection;
        updateSelection(externalSelection);
    }

    return { range, selection, selectionOptions, onSelectionChanged, customSelection, resetSelection } as const;
};

export default useTimeRangeSelection;
