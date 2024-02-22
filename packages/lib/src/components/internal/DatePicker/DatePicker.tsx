import cx from 'classnames';
import { forwardRef } from 'preact/compat';
import { Ref, useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { EMPTY_OBJECT, noop } from '@src/utils/common';
import useReflex from '@src/hooks/useReflex';
import useTimezone from '@src/components/internal/Calendar/hooks/useTimezone';
import { DEFAULT_FIRST_WEEK_DAY } from '@src/components/internal/Calendar/calendar/timerange/presets/shared/offsetWeek';
import { DateFilterProps } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import TimeRangeSelector from './components/TimeRangeSelector';
import Calendar from '../Calendar';
import calendar from '../Calendar/calendar';
import useCalendarControlsRendering from '../Calendar/hooks/useCalendarControlsRendering';
import { CalendarHandle, CalendarProps } from '../Calendar/types';
import './DatePicker.scss';

export type DatePickerProps = CalendarProps &
    Pick<DateFilterProps, 'selectedPresetOption' | 'timeRangePresetOptions'> & {
        onPresetOptionSelected?: (option: string) => any;
        showTimezoneInfo?: boolean;
    };

const DatePicker = forwardRef((props: DatePickerProps, ref) => {
    const { i18n } = useCoreContext();
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering(props.renderControl);
    const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
    const now = useMemo(() => Date.now(), []);

    const withTimezone = useMemo(() => props.showTimezoneInfo !== false, [props.showTimezoneInfo]);
    const { clockTime: time, GMTOffset: offset } = useTimezone({ withClock: withTimezone });

    const datePickerClassName = useMemo(() => cx([{ 'adyen-fp-datepicker--with-timezone': withTimezone }, 'adyen-fp-datepicker']), [withTimezone]);
    const timezoneI18nOptions = useMemo(() => (withTimezone ? { values: { offset, time } } : EMPTY_OBJECT), [offset, time, withTimezone]);

    const calendarRef = useReflex<CalendarHandle>(noop, ref as Ref<CalendarHandle>);

    const onHighlight = useCallback(() => {
        setLastUpdatedTimestamp(performance.now());

        if (calendarRef.current?.from && calendarRef.current?.to) {
            props.onHighlight?.(+calendarRef.current?.from, +calendarRef.current?.to);
        }
    }, [setLastUpdatedTimestamp, props.onHighlight]);

    return (
        <div className={datePickerClassName}>
            <div className={'adyen-fp-datepicker__selector-container'}>
                <TimeRangeSelector
                    now={now}
                    calendarRef={calendarRef}
                    onTimeRangeSelected={props.onPresetOptionSelected}
                    options={props.timeRangePresetOptions}
                    selectedOption={props.selectedPresetOption}
                    timestamp={lastUpdatedTimestamp}
                />
            </div>
            <div ref={controlsContainerRef} role="group" className={'adyen-fp-datepicker__controls'} aria-label={i18n.get('calendar.controls')} />
            <Calendar
                {...props}
                ref={calendarRef}
                firstWeekDay={DEFAULT_FIRST_WEEK_DAY}
                dynamicBlockRows={true}
                onlyCellsWithin={true}
                controls={props.controls ?? calendar.controls.MINIMAL}
                highlight={props.highlight ?? calendar.highlight.MANY}
                onHighlight={onHighlight}
                renderControl={controlsRenderer}
            />
            {withTimezone && <div className={'adyen-fp-datepicker__timezone'}>{i18n.get('calendar.timezone', timezoneI18nOptions)}</div>}
        </div>
    );
});

export default DatePicker;
