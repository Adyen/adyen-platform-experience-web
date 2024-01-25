import { forwardRef } from 'preact/compat';
import { Ref, useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { noop } from '@src/utils/common';
import useReflex from '@src/hooks/useReflex';
import { DEFAULT_FIRST_WEEK_DAY } from '@src/components/internal/Calendar/calendar/timerange/presets/shared/weekAgo';
import { DateFilterProps } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import TimeRangeSelector, { useTimeRangeSelection } from './components/TimeRangeSelector';
import Calendar from '../Calendar';
import calendar from '../Calendar/calendar';
import useCalendarControlsRendering from '../Calendar/hooks/useCalendarControlsRendering';
import { CalendarHandle, CalendarProps } from '../Calendar/types';
import './DatePicker.scss';

export type DatePickerProps = CalendarProps &
    Pick<DateFilterProps, 'selectedPresetOption' | 'timeRangePresetOptions'> & {
        onPresetOptionSelected?: (option: string) => any;
    };

const DatePicker = forwardRef((props: DatePickerProps, ref) => {
    const now = useMemo(() => Date.now(), []);
    const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering(props.renderControl);

    const { customSelection, from, onSelection, options, selectedOption, to } = useTimeRangeSelection({
        now,
        options: props.timeRangePresetOptions,
        selectedOption: props.selectedPresetOption,
    });

    const calendarRef = useReflex<CalendarHandle>(noop, ref as Ref<CalendarHandle>);
    const lastUpdateTimestamp = useRef(lastUpdatedTimestamp);
    const rangeSelectionInProgress = useRef(true);

    const onHighlight = useCallback(() => {
        setLastUpdatedTimestamp(performance.now());

        if (calendarRef.current?.from && calendarRef.current?.to) {
            props.onHighlight?.(+calendarRef.current?.from, +calendarRef.current?.to);
        }
    }, [setLastUpdatedTimestamp, props.onHighlight]);

    useEffect(() => {
        if (calendarRef.current && from && to) {
            rangeSelectionInProgress.current = true;
            calendarRef.current.from = new Date(from as string);
            calendarRef.current.to = new Date(to as string);
        }
    }, [from, to]);

    useEffect(() => {
        if (lastUpdateTimestamp.current !== lastUpdatedTimestamp) {
            lastUpdateTimestamp.current = lastUpdatedTimestamp;

            if (rangeSelectionInProgress.current) {
                rangeSelectionInProgress.current = false;
            } else customSelection();
        }
    }, [customSelection, lastUpdatedTimestamp]);

    useEffect(() => {
        selectedOption && props.onPresetOptionSelected?.(selectedOption);
    }, [selectedOption]);

    return (
        <>
            <div className={'adyen-fp-datepicker__selector-container'}>
                <TimeRangeSelector options={options} selectedOption={selectedOption} onSelection={onSelection} />
            </div>
            <div ref={controlsContainerRef} className={'adyen-fp-datepicker__controls'} role="group" />
            <Calendar
                {...props}
                ref={calendarRef}
                firstWeekDay={DEFAULT_FIRST_WEEK_DAY}
                dynamicBlockRows={false}
                onlyCellsWithin={false}
                controls={props.controls ?? calendar.controls.MINIMAL}
                highlight={props.highlight ?? calendar.highlight.MANY}
                onHighlight={onHighlight}
                renderControl={controlsRenderer}
            />
        </>
    );
});

export default DatePicker;
