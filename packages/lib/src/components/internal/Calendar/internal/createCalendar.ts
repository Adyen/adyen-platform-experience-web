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
    MAX_MONTH_DAYS
} from './utils';

const DAY_OF_THE_WEEK_FORMATS = ['long', 'short', 'narrow'] as const;

const computeMonthNumberOfDays = (numberOfWeeks: number) => Math.max(4, Math.min(numberOfWeeks, 6)) * 7;
const getCalendarDateString = (date: Date) => date.toISOString().replace(/T[\w\W]*$/, '');
const getFixedMonthNumberOfDays = () => MAX_MONTH_DAYS;
const isFirstWeekDayAt = (index: number) => !(index % 7);
const isWeekendFactory = (weekends: readonly [CalendarDay, CalendarDay]) => (index: number) => weekends.includes((index % 7) as CalendarDay);

const createCalendar = (config: CalendarConfig, offset: number) => {
    const cachedMonths: CalendarMonthView[] = [];
    const cachedWeeks: CalendarWeekView[] = [];
    const cachedOffsets: Array<readonly [number, number, number, number, number]> = [];
    const transitionWeeks: number[] = [];
    const timeSlice = getCalendarTimeSliceParameters(config, offset);

    const { dynamicMonthWeeks, firstWeekDay = 0, locale } = config;
    const [ numberOfMonths, originTimestamp, minOffset, maxOffset ] = timeSlice;
    const getMonthNumberOfDays = dynamicMonthWeeks === true ? computeMonthNumberOfDays : getFixedMonthNumberOfDays;
    const isWeekendAt = isWeekendFactory(getWeekendDays(firstWeekDay)); // [TODO]: derive this based on locale (if possible)

    let days = 0;
    let month: number;
    let year: number;
    let calendarStartMonthTimestamp: number;
    let calendarStartMonthOffset = timeSlice[4];
    let cursorMonth: number;
    let cursorPosition: number;

    const getCalendarDateByIndex = (startIndexOffset = 0) => (index: number) => getCalendarDateString(
        new Date(calendarStartMonthTimestamp + (startIndexOffset + index) * DAY_MS)
    );

    const shiftCalendar: ShiftCalendar = (monthOffset: number, shift: CalendarShift = CalendarShift.MONTH) => {
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
            refreshCalendar();
        }

        return calendarStartMonthOffset;
    };

    const shiftCalendarCursor: ShiftCalendarCursor = (shift?: CalendarCursorShift) => {
        if (cursorMonth === undefined) cursorMonth = 0;

        const startIndex = cachedOffsets[cursorMonth]?.[0] || 0;
        const monthStart = startIndex + (cachedOffsets[cursorMonth]?.[1] as number);
        const monthEnd = startIndex + (cachedOffsets[cursorMonth]?.[2] as number) - 1;

        if (cursorPosition === undefined) cursorPosition = monthStart;
        if (shift === undefined) return cursorPosition;

        switch (shift) {
            case CalendarCursorShift.FIRST_MONTH_DAY: return cursorPosition = monthStart;
            case CalendarCursorShift.LAST_MONTH_DAY: return cursorPosition = monthEnd;
        }

        const weekStart = Math.floor(cursorPosition / 7) * 7;

        switch (shift) {
            case CalendarCursorShift.FIRST_WEEK_DAY: return cursorPosition = Math.max(monthStart, weekStart);
            case CalendarCursorShift.LAST_WEEK_DAY: return cursorPosition = Math.min(monthEnd, weekStart + 6);
        }

        const weekDay = cursorPosition % 7;

        switch (shift) {
            case CalendarCursorShift.NEXT_WEEK: {
                if (cursorPosition + 7 > monthEnd) {
                    if (cursorMonth + 1 === numberOfMonths) {
                        shiftCalendar(1, CalendarShift.WINDOW);
                        const newMonthStartIndex = cachedOffsets[cursorMonth = 0]?.[0] || 0;
                        const newMonthStart = newMonthStartIndex + (cachedOffsets[cursorMonth]?.[1] as number);
                        return cursorPosition = weekDay < newMonthStart ? weekDay + 7 : weekDay;
                    } else cursorMonth += 1;
                }
                return cursorPosition += 7;
            }
            case CalendarCursorShift.PREV_WEEK: {
                if (cursorPosition - 7 < monthStart) {
                    if (cursorMonth - 1 < 0) {
                        shiftCalendar(-1, CalendarShift.WINDOW);
                        const newMonthStartIndex = cachedOffsets[cursorMonth = numberOfMonths - 1]?.[0] || 0;
                        const newMonthEnd = newMonthStartIndex + (cachedOffsets[cursorMonth]?.[2] as number) - 1;
                        const newCursorPosition = Math.floor(newMonthEnd / 7) * 7 + weekDay;
                        return cursorPosition = newCursorPosition > newMonthEnd ? newCursorPosition - 7: newCursorPosition;
                    } else cursorMonth -= 1;
                }
                return cursorPosition -= 7;
            }
            case CalendarCursorShift.PREV_WEEK_DAY:
                return cursorPosition -= +(weekDay > 0 && cursorPosition > monthStart);
            case CalendarCursorShift.NEXT_WEEK_DAY:
            default:
                return cursorPosition += +(weekDay < 6 && cursorPosition < monthEnd);
        }
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
    };

    refreshCalendar();

    // [TODO]: Clean up calendar iterator properties with reusable logic and cache
    const calendar = createCalendarIterable<string, CalendarView>({
        daysOfTheWeek: {
            value: createCalendarIterable<readonly [string, string, string]>({
                offset: { value: 0 },
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
                offset: { value: 0 },
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

                cachedMonths[monthIndex] = createCalendarIterable<string, CalendarMonthView>({
                    intersectsWithNext: { value: transitionWeeks.includes(endWeekIndex - 1) },
                    intersectsWithPrev: { value: transitionWeeks.includes(startWeekIndex) },
                    isFirstWeekDayAt: { value: isFirstWeekDayAt },
                    isWeekendAt: { value: isWeekendAt },
                    isWithinMonthAt: { value: isWithinMonthAt },
                    month: { value: (month + monthIndex) % 12 },
                    offset: { value: 0 },
                    size: { value: (endWeekIndex - startWeekIndex) * 7 },
                    weeks: {
                        value: createCalendarIterable<CalendarMonthWeekView>({
                            offset: { value: 0 },
                            size: { value: endWeekIndex - startWeekIndex }
                        }, weekIndex => {
                            const startIndexOffset = weekIndex * 7;

                            return createCalendarIterable<string, CalendarMonthWeekView>({
                                isFirstWeekDayAt: { value: isFirstWeekDayAt },
                                isTransitionWeek: { value: transitionWeeks.includes(weekIndex) },
                                isWeekendAt: { value: isWeekendAt },
                                isWithinMonthAt: { value: (index: number) => isWithinMonthAt(startIndexOffset + index) },
                                offset: { value: 0 },
                                size: { value: 7 }
                            }, getCalendarDateByIndex((startWeekIndex + weekIndex) * 7)) as CalendarMonthWeekView;
                        })
                    },
                    year: { value: year + Math.floor((month + monthIndex) / 12) }
                }, getCalendarDateByIndex(startIndex));

                return cachedMonths[monthIndex] as CalendarMonthView;
            })
        },
        offset: { value: 0 },
        size: { get: () => days },
        weeks: {
            value: createCalendarIterable<CalendarWeekView>({
                offset: { value: 0 },
                size: { get: () => days / 7 }
            }, weekIndex => {
                cachedWeeks[weekIndex] = cachedWeeks[weekIndex] || createCalendarIterable<string, CalendarWeekView>({
                    isFirstWeekDayAt: { value: isFirstWeekDayAt },
                    isTransitionWeek: { value: transitionWeeks.includes(weekIndex) },
                    isWeekendAt: { value: isWeekendAt },
                    offset: { value: 0 },
                    size: { value: 7 }
                }, getCalendarDateByIndex(weekIndex * 7));

                return cachedWeeks[weekIndex] as CalendarWeekView;
            })
        }
    }, getCalendarDateByIndex(0)) as CalendarView;

    return [calendar, shiftCalendar, shiftCalendarCursor] as CalendarViewRecord;
};

export default createCalendar;
export { getCalendarDateString };
