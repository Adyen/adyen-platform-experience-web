import {
    CalendarDate,
    CalendarDay,
    CalendarMonth,
    CalendarMonthEndDate,
    CalendarSlidingWindow,
    CalendarSlidingWindowMonths
} from './types';

export const DAY_MS = 86400000;
export const MONTH_DAYS = 42;

const assertCalendarOffset = (offset: number) => {
    if (!Number.isSafeInteger(offset)) throw new TypeError('INVALID_OFFSET');
};

export const getDateStart = (date: CalendarDate = Date.now(), useTodayStartAsFallback = false) => {
    let targetDate: Date;
    try {
        targetDate = new Date(date);
    } catch (ex) {
        if (useTodayStartAsFallback) targetDate = new Date();
        else throw ex;
    }
    return targetDate.setHours(12, 0, 0, 0);
};

export const getMonthStart = (date: CalendarDate = Date.now(), offset = 0) => {
    assertCalendarOffset(offset);
    const dateStart = new Date(getDateStart(date)); // @ts-ignore
    return dateStart.setMonth(dateStart.getMonth() + offset, 1);
};

export const getMonthEndDate = (date: CalendarDate = Date.now(), offset = 0) => (
    new Date(getMonthStart(date, offset + 1) - DAY_MS).getDate() as CalendarMonthEndDate
);

export const getMonthStartDayOffset = (firstWeekDay: CalendarDay = 0, date: CalendarDate = Date.now(), offset = 0) => {
    const monthStartDay = new Date(getMonthStart(date, offset)).getDay() as CalendarDay;
    return (monthStartDay - firstWeekDay + 7) % 7 as CalendarDay;
};

export const getCalendarSlidingWindow = (months: CalendarSlidingWindowMonths = 1, date: CalendarDate = Date.now(), offset = 0) => {
    const dateMonth = new Date(getMonthStart(date, offset)).getMonth() as CalendarMonth;
    return [Math.floor(dateMonth / months) * months, dateMonth % months] as const;
};

export const createCalendar = () => {
    let immutableDates: Readonly<CalendarSlidingWindow['dates']> = Object.freeze([]);
    let immutableOffsets: Readonly<CalendarSlidingWindow['offsets']> = Object.freeze([]);

    const $window = Object.create(null, {
        dates: { get: () => immutableDates },
        offsets: { get: () => immutableOffsets }
    }) as CalendarSlidingWindow;

    return (
        calendarMonths: CalendarSlidingWindowMonths = 1,
        firstWeekDay: CalendarDay = 0,
        timestamp = Date.now(),
        offset = 0
    ) => {
        const dates: CalendarSlidingWindow['dates'] = [];
        const offsets: CalendarSlidingWindow['offsets'] = [];
        const [, windowMonthOffset ] = getCalendarSlidingWindow(calendarMonths, timestamp, offset);

        let calendarEndIndex = MONTH_DAYS;
        let calendarTimestamp = timestamp;

        for (let i = 0; i < calendarMonths; i++) {
            const thisMonthOffset = offset - windowMonthOffset + i;
            const startDayOffset = getMonthStartDayOffset(firstWeekDay, timestamp, thisMonthOffset);
            const monthEndDate = getMonthEndDate(timestamp, thisMonthOffset);

            const monthStartIndex = ((offsets[i - 1]?.[2] as number) - startDayOffset) || 0;
            const monthStartDateIndex = monthStartIndex + startDayOffset;
            const monthEndDateIndex = monthStartDateIndex + monthEndDate;
            const monthEndIndex = calendarEndIndex = monthStartIndex + MONTH_DAYS;

            if (i === 0) {
                if (startDayOffset > 0) {
                    const prevMonthStart = getMonthStart(timestamp, thisMonthOffset - 1);
                    const prevMonthEndDate = getMonthEndDate(timestamp, thisMonthOffset - 1);
                    calendarTimestamp = prevMonthStart + (prevMonthEndDate - startDayOffset) * DAY_MS;
                } else calendarTimestamp = getMonthStart(timestamp, thisMonthOffset);
            }

            offsets[i] = [ monthStartIndex, monthStartDateIndex, monthEndDateIndex, monthEndIndex ];
        }

        for (let i = 0; i < calendarEndIndex; i++) {
            dates[i] = new Date(calendarTimestamp + i * DAY_MS).toISOString().replace(/T[\w\W]*$/, '');
        }

        immutableDates = Object.freeze(dates);
        immutableOffsets = Object.freeze(offsets);

        return $window;
    };
};
