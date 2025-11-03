import cx from 'classnames';
import useTimeRangeSelection from '../../hooks/useTimeRangeSelection';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { boolOrTrue, EMPTY_OBJECT, noop } from '../../../../../utils';
import useTimezone from '../../../../internal/Calendar/hooks/useTimezone';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';
import { CalendarProps } from '../../../../internal/Calendar/types';
import { DEFAULT_FIRST_WEEK_DAY } from '../../../../internal/Calendar/calendar/timerange/presets/shared/offsetWeek';
import useCalendarControlsRendering from '../../../../internal/Calendar/hooks/useCalendarControlsRendering';
import useCalendar from '../../../../internal/Calendar/hooks/useCalendar';
import Select from '../../../../internal/FormFields/Select';
import calendar from '../../../../internal/Calendar/calendar';
import CalendarControls from '../../../../internal/Calendar/components/CalendarControls/CalendarControls';
import CalendarGrid from '../../../../internal/Calendar/components/CalendarGrid/CalendarGrid';

export interface DatePickerProps<T extends string> {
    range?: RangeTimestamps;
    customRangeSelection: ReturnType<typeof useTimeRangeSelection<T>>['customSelection'];
    onRangeSelectionChanged: ReturnType<typeof useTimeRangeSelection<T>>['onSelectionChanged'];
    rangeSelection: ReturnType<typeof useTimeRangeSelection<T>>['selection'];
    rangeOptions: ReturnType<typeof useTimeRangeSelection<T>>['selectionOptions'];
    rangeSelectLabel?: string;
    showTimezoneInfo?: boolean;
    sinceDate?: string;
    timezone?: Intl.DateTimeFormatOptions['timeZone'];
    untilDate?: string;
}

const getRangeTimestamps = (range?: RangeTimestamps, timezone?: Intl.DateTimeFormatOptions['timeZone']) => {
    let restoreRangeTimezone = noop;
    try {
        if (range != undefined) {
            const timezoneToRestore = range.timezone;
            range.timezone = timezone;
            restoreRangeTimezone = () => void (range.timezone = timezoneToRestore);
        }
        const { from, to } = range ?? (EMPTY_OBJECT as NonNullable<typeof range>);
        return { from, to };
    } finally {
        restoreRangeTimezone();
    }
};

const DatePicker = <T extends string>({
    range,
    customRangeSelection,
    onRangeSelectionChanged,
    rangeOptions,
    rangeSelection,
    rangeSelectLabel,
    showTimezoneInfo,
    timezone,
    ...calendarProps
}: DatePickerProps<T>) => {
    const cachedHighlight = useRef<RangeTimestamps>();
    const cachedRangeSelection = useRef<typeof rangeSelection>();
    const withTimezone = useMemo(() => boolOrTrue(showTimezoneInfo), [showTimezoneInfo]);

    const { i18n } = useCoreContext();
    const { clockTime: time, GMTOffset: offset } = useTimezone({ timezone: timezone, withClock: withTimezone });
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering();
    const [pendingHighlight, setPendingHighlight] = useState(false);

    const onHighlight = useCallback<NonNullable<CalendarProps['onHighlight']>>((from, to) => {
        setPendingHighlight(true);
        const now = Date.now();
        const timezone = config.timezone;
        cachedHighlight.current = { now, timezone, from: from ?? now, to: to ?? now } as const;
    }, []);

    const originDate = useMemo(() => {
        const { from, to } = getRangeTimestamps(range, timezone);
        if (from != undefined && to != undefined) return [from, to];
    }, [range, timezone]);

    const datePickerClassName = useMemo(() => cx([{ 'adyen-pe-datepicker--with-timezone': withTimezone }, 'adyen-pe-datepicker']), [withTimezone]);
    const timezoneI18nOptions = useMemo(() => (withTimezone ? { values: { offset, time } } : EMPTY_OBJECT), [offset, time, withTimezone]);
    const rangeSelectorLabel = useMemo(() => rangeSelectLabel ?? i18n.get('common.filters.types.date.rangeSelect.label'), [i18n, rangeSelectLabel]);

    const getCalendarGridLabel = useCallback<CalendarProps['getGridLabel']>(
        block => i18n.get('common.filters.types.date.calendar.label', { values: { monthOfYear: block.label } }),
        [i18n]
    );

    const { cursorElementRef, cursorRootProps, grid } = useCalendar(
        {
            ...calendarProps,
            firstWeekDay: DEFAULT_FIRST_WEEK_DAY,
            dynamicBlockRows: true,
            onlyCellsWithin: true,
            originDate: originDate,
            timezone: timezone,
            controls: calendar.controls.MINIMAL,
            highlight: calendar.highlight.MANY,
            getGridLabel: getCalendarGridLabel,
            onHighlight: onHighlight,
            trackCurrentDay: true,
        },
        null
    );

    const config = grid.config();

    useEffect(() => {
        if (pendingHighlight) {
            setPendingHighlight(false);
            cachedRangeSelection.current =
                cachedRangeSelection.current === rangeSelection ? customRangeSelection(cachedHighlight.current) : rangeSelection;
        }
    }, [pendingHighlight, rangeSelection, customRangeSelection]);

    return (
        <div className={datePickerClassName}>
            {rangeOptions.length > 1 && (
                <div className={'adyen-pe-datepicker__selector-container'}>
                    <Select
                        setToTargetWidth={true}
                        items={rangeOptions}
                        filterable={false}
                        multiSelect={false}
                        onChange={onRangeSelectionChanged}
                        selected={rangeSelection}
                        aria-label={rangeSelectorLabel}
                    />
                </div>
            )}
            <div
                ref={controlsContainerRef}
                role="group"
                className={'adyen-pe-datepicker__controls'}
                aria-label={i18n.get('common.filters.types.date.calendar.navigation.label')}
            />
            <div role="none">
                <CalendarControls config={config} grid={grid} renderer={controlsRenderer} />
                <CalendarGrid
                    ref={cursorElementRef}
                    config={config}
                    cursorRootProps={cursorRootProps}
                    getGridLabel={getCalendarGridLabel}
                    grid={grid}
                    onlyCellsWithin
                />
            </div>
            {withTimezone && (
                <div className={'adyen-pe-datepicker__timezone'}>{i18n.get('common.filters.types.date.timezoneInfo', timezoneI18nOptions)}</div>
            )}
        </div>
    );
};

export default DatePicker;
