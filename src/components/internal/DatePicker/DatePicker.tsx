import cx from 'classnames';
import { forwardRef } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { Ref } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import { boolOrTrue, EMPTY_OBJECT, noop } from '../../../utils';
import useReflex from '../../../hooks/useReflex';
import useTimezone from '../Calendar/hooks/useTimezone';
import { DEFAULT_FIRST_WEEK_DAY } from '../Calendar/calendar/timerange/presets/shared/offsetWeek';
import { DateFilterProps } from '../FilterBar/filters/DateFilter/types';
import TimeRangeSelector from './components/TimeRangeSelector';
import Calendar from '../Calendar';
import calendar from '../Calendar/calendar';
import useCalendarControlsRendering from '../Calendar/hooks/useCalendarControlsRendering';
import { CalendarHandle, CalendarProps } from '../Calendar/types';
import './DatePicker.scss';

export type DatePickerProps = Omit<CalendarProps, 'getGridLabel'> &
    Pick<DateFilterProps, 'now' | 'selectedPresetOption' | 'showTimezoneInfo' | 'timeRangePresetOptions' | 'timeRangeSelectorLabel' | 'timezone'> & {
        onPresetOptionSelected?: (option: string) => any;
    };

const DatePicker = forwardRef((props: DatePickerProps, ref) => {
    const { i18n } = useCoreContext();
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering(props.renderControl);
    const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());

    const withTimezone = useMemo(() => boolOrTrue(props.showTimezoneInfo), [props.showTimezoneInfo]);
    const { clockTime: time, GMTOffset: offset } = useTimezone({ timezone: props.timezone, withClock: withTimezone });

    const datePickerClassName = useMemo(() => cx([{ 'adyen-pe-datepicker--with-timezone': withTimezone }, 'adyen-pe-datepicker']), [withTimezone]);
    const timezoneI18nOptions = useMemo(() => (withTimezone ? { values: { offset, time } } : EMPTY_OBJECT), [offset, time, withTimezone]);
    const calendarRef = useReflex<CalendarHandle>(noop, ref as Ref<CalendarHandle>);

    const getCalendarGridLabel = useCallback<CalendarProps['getGridLabel']>(
        block => i18n.get('common.filters.types.date.calendar.label', { values: { monthOfYear: block.label } }),
        [i18n]
    );

    const onHighlight = useCallback(() => {
        setLastUpdatedTimestamp(performance.now());

        if (calendarRef.current?.from && calendarRef.current?.to) {
            props.onHighlight?.(+calendarRef.current?.from, +calendarRef.current?.to);
        }
    }, [setLastUpdatedTimestamp, props.onHighlight]);

    return (
        <div className={datePickerClassName}>
            <div className={'adyen-pe-datepicker__selector-container'}>
                <TimeRangeSelector
                    now={props.now}
                    calendarRef={calendarRef}
                    onTimeRangeSelected={props.onPresetOptionSelected}
                    options={props.timeRangePresetOptions}
                    selectedOption={props.selectedPresetOption}
                    timestamp={lastUpdatedTimestamp}
                    timezone={props.timezone}
                    aria-label={props.timeRangeSelectorLabel}
                />
            </div>
            <div
                ref={controlsContainerRef}
                role="group"
                className={'adyen-pe-datepicker__controls'}
                aria-label={i18n.get('common.filters.types.date.calendar.navigation.label')}
            />
            <Calendar
                {...props}
                ref={calendarRef}
                firstWeekDay={DEFAULT_FIRST_WEEK_DAY}
                dynamicBlockRows={true}
                onlyCellsWithin={true}
                controls={props.controls ?? calendar.controls.MINIMAL}
                highlight={props.highlight ?? calendar.highlight.MANY}
                getGridLabel={getCalendarGridLabel}
                onHighlight={onHighlight}
                renderControl={controlsRenderer}
                trackCurrentDay={true}
            />
            {withTimezone && (
                <div className={'adyen-pe-datepicker__timezone'}>{i18n.get('common.filters.types.date.timezoneInfo', timezoneI18nOptions)}</div>
            )}
        </div>
    );
});

export default DatePicker;
