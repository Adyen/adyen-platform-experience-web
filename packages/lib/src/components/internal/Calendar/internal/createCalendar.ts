import createCalendarIterable from './createCalendarIterable';
import {
    CalendarConfig,
    CalendarCursorShift,
    CalendarMonthView,
    CalendarShift,
    CalendarView,
    CalendarWeekView,
    ShiftCalendar,
    ShiftCalendarCursor
} from '../types';
import {
    DAY_MS,
    DAY_OF_WEEK_FORMATS,
    getCalendarTimeSliceParameters,
    getMonthEndDate,
    getMonthFirstDayOffset,
    getMonthTimestamp,
    getWeekendDays,
    mod,
    withRelativeIndexFactory
} from './utils';

export const getCalendarDateString = (date: Date) => date.toISOString().replace(/T[\w\W]*$/, '');

const createCalendar = (config: CalendarConfig, offset: number) => {
    const cachedDaysOfWeek: (readonly [string, string, string])[] = [];
    const cachedMonths: CalendarMonthView[] = [];
    const cachedWeeks: CalendarWeekView[] = [];
    const transitionWeeks: number[] = [];
    const timeSlice = getCalendarTimeSliceParameters(config, offset);

    const { dynamicMonthWeeks = false, firstWeekDay = 0, locale, onlyMonthDays = false } = config;
    const [ numberOfMonths, originTimestamp, minOffset, maxOffset ] = timeSlice;

    let days = 0;
    let originMonth: number;
    let originMonthOffset = timeSlice[4];
    let originMonthTimestamp: number;
    let originMonthYear: number;

    let cursorMonth: number;
    let cursorMonthView: CalendarMonthView;
    let cursorPosition: number;
    let relativeCursorPosition = timeSlice[5];

    const getCalendarDateByIndex = withRelativeIndexFactory(0, (index: number) => (
        index >= 0 ? getCalendarDateString(new Date(originMonthTimestamp + index * DAY_MS)) : null
    ));

    const getRelativeMonthDateIndexFactory = (monthStart: number, monthEnd: number, indexOffset: number) =>
        withRelativeIndexFactory(indexOffset, (currentIndex: number) => (
            (currentIndex >= monthStart && currentIndex <= monthEnd) ? currentIndex : -1
        ));

    const refreshCalendar = () => {
        const firstMonthTimestamp = originMonthTimestamp = getMonthTimestamp(originTimestamp, originMonthOffset);
        const firstMonthDate = new Date(firstMonthTimestamp);

        originMonth = firstMonthDate.getMonth();
        originMonthYear = firstMonthDate.getFullYear();
        cachedMonths.length = cachedWeeks.length = transitionWeeks.length = 0;

        for (let i = 0, nextOrigin = 0, nextStartWeek = 0; i < numberOfMonths; i++) {
            const firstDayOffset = getMonthFirstDayOffset(firstWeekDay, firstMonthTimestamp, i);
            const monthDays = getMonthEndDate(firstMonthTimestamp, i);
            const monthWeeks = Math.ceil((firstDayOffset + monthDays) / 7);

            const monthOrigin = nextOrigin && nextOrigin - firstDayOffset;
            const monthStart = monthOrigin + firstDayOffset;
            const monthEnd = (nextOrigin = monthStart + monthDays) - 1;

            const monthStartWeek = nextStartWeek && nextStartWeek + (firstDayOffset && -1);
            const monthEndWeek = (nextStartWeek = monthStartWeek + monthWeeks) - 1;
            const monthViewWeeks = dynamicMonthWeeks ? Math.max(4, Math.min(monthWeeks, 6)) : 6;
            const monthViewDays = monthViewWeeks * 7;

            const monthIterationStart = onlyMonthDays ? monthStart : monthOrigin;
            const monthIterationEnd = onlyMonthDays ? monthEnd : (monthOrigin + monthViewDays - 1);

            const getWeekViewByIndex = withRelativeIndexFactory(monthStartWeek, index => {
                // return calendar.weeks[index];
                // [TODO]: Consider provisioning override for month transition weeks
                return createCalendarIterable<number, CalendarWeekView>({
                    isTransitionWeek: { value: transitionWeeks.includes(index) },
                    size: { value: 7 }
                }, getRelativeMonthDateIndexFactory(monthIterationStart, monthIterationEnd, index * 7)) as CalendarWeekView;
            });

            if (firstDayOffset && transitionWeeks[transitionWeeks.length - 1] !== monthStartWeek) {
                transitionWeeks.push(monthStartWeek);
            }

            if (monthEnd % 7 && transitionWeeks[transitionWeeks.length - 1] !== monthEndWeek) {
                transitionWeeks.push(monthEndWeek);
            }

            if (i === 0 && firstDayOffset) {
                const prevMonthTimestamp = getMonthTimestamp(firstMonthTimestamp, -1);
                const prevMonthDays = getMonthEndDate(firstMonthTimestamp, -1);
                originMonthTimestamp = prevMonthTimestamp + (prevMonthDays - firstDayOffset) * DAY_MS;
            }

            days = monthOrigin + monthViewDays;

            cachedMonths[i] = createCalendarIterable<number, CalendarMonthView>({
                days: { value: monthDays },
                end: { value: monthEnd },
                intersectsWithNext: { value: transitionWeeks.includes(monthEndWeek) },
                intersectsWithPrev: { value: transitionWeeks.includes(monthStartWeek) },
                month: { value: (originMonth + i) % 12 },
                origin: { value: monthOrigin },
                size: { value: monthViewDays },
                start: { value: monthStart },
                weeks: { value: createCalendarIterable<CalendarWeekView>(monthViewWeeks, getWeekViewByIndex) },
                year: { value: originMonthYear + Math.floor((originMonth + i) / 12) }
            }, getRelativeMonthDateIndexFactory(monthIterationStart, monthIterationEnd, monthOrigin));
        }

        return refreshCursor();
    };

    const refreshCursor = (): CalendarView => {
        if (cursorMonth === undefined) {
            cursorMonth = mod(offset - originMonthOffset, numberOfMonths);
            return refreshCursor();
        }

        cursorMonthView = cachedMonths[cursorMonth] as CalendarMonthView;
        cursorPosition = cursorMonthView.start + relativeCursorPosition;

        if (cursorPosition > cursorMonthView.end) {
            // Currently stick to the end of the cursor month, ignoring offset spill-over adjustments
            // [TODO]: Consider provisioning offset spill-over adjustments
            relativeCursorPosition = (cursorPosition = cursorMonthView.end) - cursorMonthView.start;
        }

        return calendar;
    };

    const shiftCalendar: ShiftCalendar = (monthOffset: number, shift: CalendarShift = CalendarShift.MONTH) => {
        if (monthOffset) {
            let shiftOffset = monthOffset;

            switch (shift) {
                case CalendarShift.WINDOW:
                    shiftOffset *= numberOfMonths;
                    break;
                case CalendarShift.YEAR:
                    shiftOffset *= 12;
                    break;
                case CalendarShift.MONTH:
                default:
                    shiftOffset *= 1;
                    break;
            }

            const offset = Math.max(minOffset, Math.min(originMonthOffset + shiftOffset, maxOffset));

            if (originMonthOffset !== offset) {
                originMonthOffset = offset;
                relativeCursorPosition = cursorPosition - cursorMonthView.start;
                cursorPosition = (undefined as unknown) as number;
                refreshCalendar();
            }
        }

        return originMonthOffset;
    };

    const shiftCursor: ShiftCalendarCursor = (shift?: CalendarCursorShift | number) => {
        if (shift !== undefined) {
            if (typeof shift === 'number') {
                cursorPosition = Math.max(0, Math.min(shift, days - 1));

                for (let i = 1; i <= numberOfMonths; i++) {
                    const nextRelativeCursorPosition = cursorPosition - (cachedMonths[i - 1] as CalendarMonthView).start;

                    if (nextRelativeCursorPosition >= 0) {
                        relativeCursorPosition = nextRelativeCursorPosition;
                        cursorMonth = i - 1;
                    } else break;
                }
            } else updateRelativeCursorPosition(shift);

            refreshCursor();
        }

        return cursorPosition;
    };

    const updateRelativeCursorPosition = (shift: CalendarCursorShift) => {
        switch (shift) {
            case CalendarCursorShift.FIRST_MONTH_DAY: return relativeCursorPosition = 0;
            case CalendarCursorShift.LAST_MONTH_DAY: return relativeCursorPosition = cursorMonthView.days - 1;
            case CalendarCursorShift.NEXT_MONTH: return cursorIntoNextMonthIfNecessary();
            case CalendarCursorShift.PREV_MONTH: return cursorIntoPreviousMonthIfNecessary();
            case CalendarCursorShift.NEXT_WEEK: return cursorIntoNextMonthIfNecessary(7);
            case CalendarCursorShift.PREV_WEEK: return cursorIntoPreviousMonthIfNecessary(7);
            case CalendarCursorShift.NEXT_WEEK_DAY: return cursorIntoNextMonthIfNecessary(1);
            case CalendarCursorShift.PREV_WEEK_DAY: return cursorIntoPreviousMonthIfNecessary(1);
        }

        const weekStart = Math.floor(cursorPosition / 7) * 7;
        const weekDay = cursorPosition % 7;

        switch (shift) {
            case CalendarCursorShift.FIRST_WEEK_DAY:
                return onlyMonthDays
                    ? relativeCursorPosition = Math.max(cursorMonthView.start, weekStart) - cursorMonthView.start
                    : cursorIntoPreviousMonthIfNecessary(weekDay);
            case CalendarCursorShift.LAST_WEEK_DAY:
                return onlyMonthDays
                    ? relativeCursorPosition = Math.min(cursorMonthView.end, weekStart + 6) - cursorMonthView.start
                    : cursorIntoNextMonthIfNecessary(6 - weekDay);
        }
    };

    const cursorIntoNextMonthIfNecessary = (daysOffset?: number) => {
        if (daysOffset && daysOffset > 0 && (relativeCursorPosition += daysOffset) >= cursorMonthView.days) {
            const nextRelativeCursorPosition = relativeCursorPosition -= cursorMonthView.days;
            const shouldRefreshCursorPosition = cursorMonth !== numberOfMonths - 1;

            cursorIntoNextMonthIfNecessary();
            if (shouldRefreshCursorPosition) refreshCursor();
            else relativeCursorPosition = nextRelativeCursorPosition;
        } else if (daysOffset === undefined && ++cursorMonth === numberOfMonths) {
            cursorMonth = 0;
            shiftCalendar(1, CalendarShift.WINDOW);
        }

        return relativeCursorPosition;
    };

    const cursorIntoPreviousMonthIfNecessary = (daysOffset?: number) => {
        if (daysOffset && daysOffset > 0 && (relativeCursorPosition -= daysOffset) < 0) {
            const relativeCursorPositionOffset = relativeCursorPosition += 1;
            const shouldRefreshCursorPosition = cursorMonth > 0;

            cursorIntoPreviousMonthIfNecessary();
            if (shouldRefreshCursorPosition) refreshCursor();
            relativeCursorPosition = cursorMonthView.days + relativeCursorPositionOffset - 1;
        } else if (daysOffset === undefined && --cursorMonth < 0) {
            cursorMonth = numberOfMonths - 1;
            shiftCalendar(-1, CalendarShift.WINDOW);
        }

        return relativeCursorPosition;
    };

    const calendar = createCalendarIterable<string | null, CalendarView>({
        daysOfWeek: {
            value: createCalendarIterable<readonly [string, string, string]>(7, index => (
                cachedDaysOfWeek[index] || (cachedDaysOfWeek[index] = (() => {
                    const date = new Date(originTimestamp + index * DAY_MS);
                    return Object.freeze(DAY_OF_WEEK_FORMATS.map(weekday => date.toLocaleDateString(locale, { weekday })));
                })() as readonly [string, string, string])
            ))
        },
        firstWeekDay: { value: firstWeekDay },
        months: { value: createCalendarIterable<CalendarMonthView>(numberOfMonths, index => cachedMonths[index] as CalendarMonthView) },
        shift: { value: shiftCalendar },
        shiftCursor: { value: shiftCursor },
        size: { get: () => days },
        weekendDays: { value: getWeekendDays(firstWeekDay) }, // [TODO]: Refactor and derive this based on locale (if possible)
        weeks: {
            value: createCalendarIterable<CalendarWeekView>(() => days / 7, index => (
                cachedWeeks[index] || (cachedWeeks[index] = createCalendarIterable<number, CalendarWeekView>({
                    isTransitionWeek: { value: transitionWeeks.includes(index) },
                    size: { value: 7 }
                }, withRelativeIndexFactory(index * 7)) as CalendarWeekView)
            ))
        }
    }, getCalendarDateByIndex) as CalendarView;

    return refreshCalendar();
};

export default createCalendar;
