import createCalendarIterable from './createCalendarIterable';
import {
    CalendarConfig,
    CalendarCursorShift,
    CalendarDay,
    CalendarMonthView,
    CalendarMonthWeekView,
    CalendarShift,
    CalendarView,
    CalendarViewRecord,
    CalendarWeekView,
    ShiftCalendar,
    ShiftCalendarCursor
} from '../types';
import {
    DAY_MS,
    getCalendarTimeSliceParameters,
    getMonthEndDate,
    getMonthFirstDayOffset,
    getMonthTimestamp,
    getWeekendDays,
    MAX_MONTH_DAYS,
    mod
} from './utils';

const DAY_OF_THE_WEEK_FORMATS = ['long', 'short', 'narrow'] as const;

const computeMonthNumberOfDays = (numberOfWeeks: number) => Math.max(4, Math.min(numberOfWeeks, 6)) * 7;
const getFixedMonthNumberOfDays = () => MAX_MONTH_DAYS;
const isFirstWeekDayAt = (index: number) => !(index % 7);
const isWeekendFactory = (weekends: readonly [CalendarDay, CalendarDay]) => (index: number) => weekends.includes((index % 7) as CalendarDay);
const withRelativeIndexFactory = (startIndexOffset = 0, withIndexCallback: (index: number) => any = (x => x)) =>
    (index: number) => withIndexCallback(startIndexOffset + index);

export const getCalendarDateString = (date: Date) => date.toISOString().replace(/T[\w\W]*$/, '');

const createCalendar = (config: CalendarConfig, offset: number) => {
    const cachedMonths: CalendarMonthView[] = [];
    const cachedWeeks: CalendarWeekView[] = [];
    const cachedOffsets: Array<readonly [number, number, number, number, number]> = [];
    const transitionWeeks: number[] = [];
    const timeSlice = getCalendarTimeSliceParameters(config, offset);

    const { dynamicMonthWeeks, firstWeekDay = 0, locale, onlyMonthDays = false } = config;
    const [ numberOfMonths, originTimestamp, minOffset, maxOffset ] = timeSlice;
    const getMonthNumberOfDays = dynamicMonthWeeks === true ? computeMonthNumberOfDays : getFixedMonthNumberOfDays;
    const isWeekendAt = isWeekendFactory(getWeekendDays(firstWeekDay)); // [TODO]: derive this based on locale (if possible)

    let days = 0;
    let month: number;
    let year: number;
    let calendarStartMonthTimestamp: number;
    let calendarStartMonthOffset = timeSlice[4];

    let cursorMonth: number;
    let cursorMonthEnd: number;
    let cursorMonthStart: number;
    let cursorPosition: number;
    let relativeCursorPositionMax: number;
    let relativeCursorPosition = timeSlice[5];

    const getCalendarDateByIndex = withRelativeIndexFactory(0, (index: number) => (
        getCalendarDateString(new Date(calendarStartMonthTimestamp + index * DAY_MS))
    ));

    const refreshCursorPositionParameters = () => {
        if (cursorMonth === undefined) {
            cursorMonth = mod(offset - calendarStartMonthOffset, numberOfMonths);
            refreshCursorPositionParameters();
        } else {
            const [
                startIndex = 0,
                startDayOffset = 0,
                endDayOffset = startDayOffset + relativeCursorPosition + 1
            ] = cachedOffsets[cursorMonth] || ([] as number[]);

            cursorMonthStart = startIndex + startDayOffset;
            cursorMonthEnd = startIndex + endDayOffset - 1;
            cursorPosition = cursorMonthStart + relativeCursorPosition;
            relativeCursorPositionMax = cursorMonthEnd - cursorMonthStart;

            if (cursorPosition > cursorMonthEnd) {
                // Currently stick to the end of the cursor month, ignoring offset spill-over adjustments
                // [TODO]: Consider provisioning offset spill-over adjustments
                relativeCursorPosition = (cursorPosition = cursorMonthEnd) - cursorMonthStart;
            }
        }
    };

    const cursorIntoNextMonthIfNecessary = () => {
        if (++cursorMonth === numberOfMonths) {
            cursorMonth = 0;
            shiftCalendar(1, CalendarShift.WINDOW);
        }
        return relativeCursorPosition;
    };

    const cursorIntoNextMonthIfNecessaryForDaysOffset = (daysOffset = 1) => {
        if (daysOffset > 0 && (relativeCursorPosition += daysOffset) > relativeCursorPositionMax) {
            const nextRelativeCursorPosition = relativeCursorPosition -= relativeCursorPositionMax + 1;
            const shouldRefreshCursorPosition = cursorMonth !== numberOfMonths - 1;

            cursorIntoNextMonthIfNecessary();
            if (shouldRefreshCursorPosition) refreshCursorPositionParameters();
            else relativeCursorPosition = nextRelativeCursorPosition;
        }

        return relativeCursorPosition;
    };

    const cursorIntoPreviousMonthIfNecessary = () => {
        if (--cursorMonth < 0) {
            cursorMonth = numberOfMonths - 1;
            shiftCalendar(-1, CalendarShift.WINDOW);
        }
        return relativeCursorPosition;
    };

    const cursorIntoPreviousMonthIfNecessaryForDaysOffset = (daysOffset = 1) => {
        if (daysOffset > 0 && (relativeCursorPosition -= daysOffset) < 0) {
            const relativeCursorPositionOffset = relativeCursorPosition += 1;
            const shouldRefreshCursorPosition = cursorMonth > 0;

            cursorIntoPreviousMonthIfNecessary();
            if (shouldRefreshCursorPosition) refreshCursorPositionParameters();
            relativeCursorPosition = relativeCursorPositionMax + relativeCursorPositionOffset;
        }

        return relativeCursorPosition;
    };

    const updateCalendarRelativeCursorPosition = (shift: CalendarCursorShift) => {
        switch (shift) {
            case CalendarCursorShift.FIRST_MONTH_DAY: return relativeCursorPosition = 0;
            case CalendarCursorShift.LAST_MONTH_DAY: return relativeCursorPosition = relativeCursorPositionMax;
            case CalendarCursorShift.NEXT_MONTH: return cursorIntoNextMonthIfNecessary();
            case CalendarCursorShift.PREV_MONTH: return cursorIntoPreviousMonthIfNecessary();
            case CalendarCursorShift.NEXT_WEEK: return cursorIntoNextMonthIfNecessaryForDaysOffset(7);
            case CalendarCursorShift.PREV_WEEK: return cursorIntoPreviousMonthIfNecessaryForDaysOffset(7);
        }

        const weekStart = Math.floor(cursorPosition / 7) * 7;
        const weekDay = cursorPosition % 7;

        switch (shift) {
            case CalendarCursorShift.FIRST_WEEK_DAY:
                return onlyMonthDays
                    ? relativeCursorPosition = Math.max(cursorMonthStart, weekStart) - cursorMonthStart
                    : cursorIntoPreviousMonthIfNecessaryForDaysOffset(weekDay);
            case CalendarCursorShift.LAST_WEEK_DAY:
                return onlyMonthDays
                    ? relativeCursorPosition = Math.min(cursorMonthEnd, weekStart + 6) - cursorMonthStart
                    : cursorIntoNextMonthIfNecessaryForDaysOffset(6 - weekDay);
            case CalendarCursorShift.PREV_WEEK_DAY:
                return onlyMonthDays
                    ? relativeCursorPosition -= +(weekDay > 0 && relativeCursorPosition > 0)
                    : cursorIntoPreviousMonthIfNecessaryForDaysOffset(+(weekDay > 0));
            case CalendarCursorShift.NEXT_WEEK_DAY:
                return onlyMonthDays
                    ? relativeCursorPosition += +(weekDay < 6 && relativeCursorPosition < relativeCursorPositionMax)
                    : cursorIntoNextMonthIfNecessaryForDaysOffset(+(weekDay < 6));
        }
    };

    const shiftCalendarCursor: ShiftCalendarCursor = (shift?: CalendarCursorShift | number) => {
        if (shift !== undefined) {
            if (typeof shift === 'number') {
                cursorPosition = Math.max(0, Math.min(shift, days - 1));

                for (let i = 1; i <= numberOfMonths; i++) {
                    const [
                        startIndex = 0,
                        startDayOffset = 0
                    ] = cachedOffsets[i - 1] || ([] as number[]);

                    const nextRelativeCursorPosition = cursorPosition - (startIndex + startDayOffset);

                    if (nextRelativeCursorPosition >= 0) {
                        relativeCursorPosition = nextRelativeCursorPosition;
                        cursorMonth = i - 1;
                    } else break;
                }
            } else updateCalendarRelativeCursorPosition(shift);

            refreshCursorPositionParameters();
        }

        return cursorPosition;
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

            const offset = Math.max(minOffset, Math.min(calendarStartMonthOffset + shiftOffset, maxOffset));

            if (calendarStartMonthOffset !== offset) {
                calendarStartMonthOffset = offset;
                relativeCursorPosition = cursorPosition - cursorMonthStart;
                cursorPosition = (undefined as unknown) as number;
                refreshCalendar();
            }
        }

        return calendarStartMonthOffset;
    };

    const refreshCalendar = () => {
        calendarStartMonthTimestamp = getMonthTimestamp(originTimestamp, calendarStartMonthOffset);

        const startMonthDate = new Date(calendarStartMonthTimestamp);

        month = startMonthDate.getMonth();
        year = startMonthDate.getFullYear();
        cachedMonths.length = cachedWeeks.length = cachedOffsets.length = transitionWeeks.length = 0;

        for (let i = 0, transitionWeekIndex = -1, prevEndIndex = 0, prevEndWeekIndex = 0; i < numberOfMonths; i++) {
            const startDayOffset = getMonthFirstDayOffset(firstWeekDay, calendarStartMonthTimestamp, i);
            const endDate = getMonthEndDate(calendarStartMonthTimestamp, i);
            const startIndex = prevEndIndex && prevEndIndex - startDayOffset;
            const endIndex = startDayOffset + endDate;
            const numberOfWeeks = Math.ceil(endIndex / 7);
            const numberOfDays = getMonthNumberOfDays(numberOfWeeks);
            const startWeekIndex = prevEndWeekIndex && prevEndWeekIndex + (startDayOffset && -1);

            days = startIndex + numberOfDays;
            prevEndIndex = startIndex + endIndex;
            prevEndWeekIndex = startWeekIndex + numberOfWeeks;
            cachedOffsets[i] = [startIndex, startDayOffset, endIndex, startWeekIndex, startWeekIndex + numberOfDays / 7] as const;

            if (startDayOffset > 0 && transitionWeeks[transitionWeekIndex] !== startWeekIndex) {
                transitionWeeks[++transitionWeekIndex] = startWeekIndex;
            }

            if (endIndex % 7 > 0 && transitionWeeks[transitionWeekIndex] !== prevEndWeekIndex - 1) {
                transitionWeeks[++transitionWeekIndex] = prevEndWeekIndex - 1;
            }
        }

        if (cachedOffsets[0] && cachedOffsets[0][1]) {
            const prevMonthStart = getMonthTimestamp(calendarStartMonthTimestamp, -1);
            const prevMonthEndDate = getMonthEndDate(calendarStartMonthTimestamp, -1);
            calendarStartMonthTimestamp = prevMonthStart + (prevMonthEndDate - cachedOffsets[0][1]) * DAY_MS;
        }

        refreshCursorPositionParameters();
    };

    refreshCalendar();

    // [TODO]: Clean up calendar iterator properties with reusable logic and cache
    const calendar = createCalendarIterable<string, CalendarView>({
        daysOfTheWeek: {
            value: createCalendarIterable<readonly [string, string, string]>({
                size: { value: 7 },
            }, index => {
                const date = new Date(calendar[index] as string);
                return Object.freeze(DAY_OF_THE_WEEK_FORMATS.map(weekday => date.toLocaleDateString(locale, { weekday })) as [string, string, string]);
            })
        },
        isFirstWeekDayAt: { value: isFirstWeekDayAt },
        isWeekendAt: { value: isWeekendAt },
        months: {
            value: createCalendarIterable<CalendarMonthView>({
                size: { value: numberOfMonths }
            }, monthIndex => {
                if (cachedMonths[monthIndex]) return cachedMonths[monthIndex] as CalendarMonthView;

                const [
                    startIndex = 0,
                    startDayOffset = 0,
                    endIndex = 0,
                    startWeekIndex = 0,
                    endWeekIndex = 0
                ] = cachedOffsets[monthIndex] || [];

                const isWithinMonthAt = (index: number) => index >= startDayOffset && index < endIndex;

                cachedMonths[monthIndex] = createCalendarIterable<number, CalendarMonthView>({
                    intersectsWithNext: { value: transitionWeeks.includes(endWeekIndex - 1) },
                    intersectsWithPrev: { value: transitionWeeks.includes(startWeekIndex) },
                    isFirstWeekDayAt: { value: isFirstWeekDayAt },
                    isWeekendAt: { value: isWeekendAt },
                    isWithinMonthAt: { value: isWithinMonthAt },
                    month: { value: (month + monthIndex) % 12 },
                    size: { value: (endWeekIndex - startWeekIndex) * 7 },
                    weeks: {
                        value: createCalendarIterable<CalendarMonthWeekView>({
                            size: { value: endWeekIndex - startWeekIndex }
                        }, weekIndex => {
                            const startIndexOffset = weekIndex * 7;

                            return createCalendarIterable<number, CalendarMonthWeekView>({
                                isFirstWeekDayAt: { value: isFirstWeekDayAt },
                                isTransitionWeek: { value: transitionWeeks.includes(weekIndex) },
                                isWeekendAt: { value: isWeekendAt },
                                isWithinMonthAt: { value: (index: number) => isWithinMonthAt(startIndexOffset + index) },
                                size: { value: 7 }
                            }, withRelativeIndexFactory((startWeekIndex + weekIndex) * 7)) as CalendarMonthWeekView;
                        })
                    },
                    year: { value: year + Math.floor((month + monthIndex) / 12) }
                }, withRelativeIndexFactory(startIndex));

                return cachedMonths[monthIndex] as CalendarMonthView;
            })
        },
        size: { get: () => days },
        weeks: {
            value: createCalendarIterable<CalendarWeekView>({
                size: { get: () => days / 7 }
            }, weekIndex => {
                cachedWeeks[weekIndex] = cachedWeeks[weekIndex] || createCalendarIterable<number, CalendarWeekView>({
                    isFirstWeekDayAt: { value: isFirstWeekDayAt },
                    isTransitionWeek: { value: transitionWeeks.includes(weekIndex) },
                    isWeekendAt: { value: isWeekendAt },
                    size: { value: 7 }
                }, withRelativeIndexFactory(weekIndex * 7));

                return cachedWeeks[weekIndex] as CalendarWeekView;
            })
        }
    }, getCalendarDateByIndex) as CalendarView;

    return [calendar, shiftCalendar, shiftCalendarCursor] as CalendarViewRecord;
};

export default createCalendar;
