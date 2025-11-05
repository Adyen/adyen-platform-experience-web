import { AriaAttributes } from 'preact/compat';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import Select from '../../../FormFields/Select';
import { SelectChangeEvent, SelectItem } from '../../../FormFields/Select/types';
import { useTimeRangeSelection, UseTimeRangeSelectionConfig } from './useTimeRangeSelection';

const TimeRangeSelector = ({
    ['aria-label']: ariaLabel,
    calendarRef,
    onTimeRangeSelected,
    timestamp,
    ...useTimeRangeSelectionConfig
}: UseTimeRangeSelectionConfig &
    Pick<AriaAttributes, 'aria-label'> & {
        calendarRef?: any;
        onTimeRangeSelected?: (option: string) => any;
        timestamp: DOMHighResTimeStamp;
    }) => {
    const { customSelection, from, onSelection, options, selectedOption, to } = useTimeRangeSelection(useTimeRangeSelectionConfig);
    const selectOptions = useMemo(() => Object.freeze(options.map(id => ({ id, name: id }) as SelectItem)), [options]);
    const onSelectedOptionChanged = useCallback(({ target }: SelectChangeEvent) => onSelection(target?.value), [onSelection]);
    const rangeSelectionInProgress = useRef(true);
    const cachedTimestamp = useRef(timestamp);

    useEffect(() => {
        if (calendarRef?.current && from && to) {
            rangeSelectionInProgress.current = true;
            calendarRef.current.from = new Date(from);
            calendarRef.current.to = new Date(to);
        }
    }, [calendarRef, from, to]);

    useEffect(() => {
        if (cachedTimestamp.current !== timestamp) {
            cachedTimestamp.current = timestamp;

            if (rangeSelectionInProgress.current) {
                rangeSelectionInProgress.current = false;
            } else customSelection();
        }
    }, [customSelection, timestamp]);

    useEffect(() => {
        selectedOption && onTimeRangeSelected?.(selectedOption);
    }, [selectedOption, onTimeRangeSelected]);

    return (
        <Select
            setToTargetWidth={true}
            items={selectOptions}
            filterable={false}
            multiSelect={false}
            onChange={onSelectedOptionChanged}
            selected={selectedOption}
            aria-label={ariaLabel}
        />
    );
};

export default TimeRangeSelector;
