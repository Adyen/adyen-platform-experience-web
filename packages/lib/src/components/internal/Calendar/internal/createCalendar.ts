import { CalendarFirstWeekDay, CalendarSlidingWindow, CalendarSlidingWindowMonth } from '../types';
import {
    DAY_MS,
    getCalendarSlidingWindow,
    getMonthEndDate,
    getMonthFirstDayOffset,
    getMonthTimestamp,
    MONTH_DAYS
} from '../utils';

const createCalendar = () => {
    let immutableDates: Readonly<CalendarSlidingWindow['dates']> = Object.freeze([]);
    let immutableOffsets: Readonly<CalendarSlidingWindow['offsets']> = Object.freeze([]);

    const $window = Object.create(null, {
        dates: { get: () => immutableDates },
        offsets: { get: () => immutableOffsets }
    }) as CalendarSlidingWindow;

    return (
        calendarMonths: CalendarSlidingWindowMonth = 1,
        firstWeekDay: CalendarFirstWeekDay = 0,
        timestamp = Date.now(),
        offset = 0
    ) => {
        const dates: CalendarSlidingWindow['dates'] = [];
        const offsets: CalendarSlidingWindow['offsets'] = [];
        const [, windowMonthOffset ] = getCalendarSlidingWindow(calendarMonths, timestamp, offset);

        let calendarEndIndex = MONTH_DAYS;
        let calendarTimestamp = timestamp;

        for (let i = 0, prevMonthEndDateIndex = 0; i < calendarMonths; i++) {
            const thisMonthOffset = offset - windowMonthOffset + i;
            const startDayOffset = getMonthFirstDayOffset(firstWeekDay, timestamp, thisMonthOffset);
            const monthEndDate = getMonthEndDate(timestamp, thisMonthOffset);
            const monthStartIndex = prevMonthEndDateIndex && prevMonthEndDateIndex - startDayOffset;

            calendarEndIndex = monthStartIndex + MONTH_DAYS;
            prevMonthEndDateIndex = monthStartIndex + startDayOffset + monthEndDate;

            if (i === 0) {
                if (startDayOffset > 0) {
                    const prevMonthStart = getMonthTimestamp(timestamp, thisMonthOffset - 1);
                    const prevMonthEndDate = getMonthEndDate(timestamp, thisMonthOffset - 1);
                    calendarTimestamp = prevMonthStart + (prevMonthEndDate - startDayOffset) * DAY_MS;
                } else calendarTimestamp = getMonthTimestamp(timestamp, thisMonthOffset);
            }

            offsets[i] = [ monthStartIndex, startDayOffset, prevMonthEndDateIndex - monthStartIndex ];
        }

        for (let i = 0; i < calendarEndIndex; i++) {
            dates[i] = new Date(calendarTimestamp + i * DAY_MS).toISOString().replace(/T[\w\W]*$/, '');
        }

        immutableDates = Object.freeze(dates);
        immutableOffsets = Object.freeze(offsets);

        return $window;
    };
};

export default createCalendar;
