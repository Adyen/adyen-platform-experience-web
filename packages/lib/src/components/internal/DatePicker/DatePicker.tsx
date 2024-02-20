import cx from 'classnames';
import { forwardRef } from 'preact/compat';
import { Ref, useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { EMPTY_OBJECT, noop } from '@src/utils/common';
import useReflex from '@src/hooks/useReflex';
import useTimezone from '@src/components/internal/Calendar/hooks/useTimezone';
import { DEFAULT_FIRST_WEEK_DAY } from '@src/components/internal/Calendar/calendar/timerange/presets/shared/offsetWeek';
import { DateFilterProps } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import { useTimeRangeSelection } from './components/TimeRangeSelector';
import Calendar from '../Calendar';
import calendar from '../Calendar/calendar';
import useCalendarControlsRendering from '../Calendar/hooks/useCalendarControlsRendering';
import { CalendarHandle, CalendarProps } from '../Calendar/types';
import './DatePicker.scss';
import Select from '@src/components/internal/FormFields/Select';
import { SelectItem } from '@src/components/internal/FormFields/Select/types';
import { renderSelectOptionWithCheckmarking } from '@src/components/internal/FormFields/Select/utils/rendering';

export type DatePickerProps = CalendarProps &
    Pick<DateFilterProps, 'selectedPresetOption' | 'timeRangePresetOptions'> & {
        onPresetOptionSelected?: (option: string) => any;
        showTimezoneInfo?: boolean;
    };

const DatePicker = forwardRef((props: DatePickerProps, ref) => {
    const { i18n } = useCoreContext();
    const now = useMemo(() => Date.now(), []);
    const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering(props.renderControl);

    const { customSelection, from, onSelection, options, selectedOption, to } = useTimeRangeSelection({
        now,
        options: props.timeRangePresetOptions,
        selectedOption: props.selectedPresetOption,
    });

    const onSelectedOptionChanged = useCallback(({ target }: any) => onSelection(target?.value), [onSelection]);
    const selectOptions = useMemo(() => Object.freeze(options.map(id => ({ id, name: id } as SelectItem))), [options]);
    const withTimezone = useMemo(() => props.showTimezoneInfo !== false, [props.showTimezoneInfo]);
    const { clockTime: time, GMTOffset: offset } = useTimezone({ withClock: withTimezone });

    const datePickerClassName = useMemo(() => cx([{ 'adyen-fp-datepicker--with-timezone': withTimezone }, 'adyen-fp-datepicker']), [withTimezone]);
    const timezoneI18nOptions = useMemo(() => (withTimezone ? { values: { offset, time } } : EMPTY_OBJECT), [offset, time, withTimezone]);

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
        <div className={datePickerClassName}>
            <div className={'adyen-fp-datepicker__selector-container'}>
                <Select
                    classNameModifiers={['checkmarked']}
                    items={selectOptions}
                    onChange={onSelectedOptionChanged}
                    renderListItem={renderSelectOptionWithCheckmarking}
                    placeholder={selectedOption}
                    selected={selectedOption}
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
