import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import Select from '../../../FormFields/Select';
import { SelectItem } from '../../../FormFields/Select/types';
import { useTimeRangeSelection, UseTimeRangeSelectionConfig } from './useTimeRangeSelection';

const TimeRangeSelector = ({
    calendarRef,
    onTimeRangeSelected,
    timestamp,
    ...useTimeRangeSelectionConfig
}: UseTimeRangeSelectionConfig & {
    calendarRef?: any;
    onTimeRangeSelected?: (option: string) => any;
    timestamp: DOMHighResTimeStamp;
}) => {
    const { customSelection, from, onSelection, options, selectedOption, to } = useTimeRangeSelection(useTimeRangeSelectionConfig);
    const selectOptions = useMemo(() => Object.freeze(options.map(id => ({ id, name: id } as SelectItem))), [options]);
    const onSelectedOptionChanged = useCallback(({ target }: any) => onSelection(target?.value), [onSelection]);
    const rangeSelectionInProgress = useRef(true);
    const cachedTimestamp = useRef(timestamp);

    useEffect(() => {
        if (calendarRef?.current && from && to) {
            rangeSelectionInProgress.current = true;
            calendarRef.current.from = new Date(from as string);
            calendarRef.current.to = new Date(to as string);
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
        />
    );
};

export default TimeRangeSelector;
