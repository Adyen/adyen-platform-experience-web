import {
    CalendarConfig,
    CalendarDate,
    CalendarDay,
    CalendarFirstWeekDay,
    CalendarMonth,
    CalendarMonthEndDate,
    CalendarSlidingWindowMonth
} from '../types';

export const DAY_MS = 86400000;
export const MAX_MONTH_DAYS = 42;
export const WEEKEND_DAYS_SEED = Object.freeze([0, 1] as const);
export const CALENDAR_WINDOW_MONTHS = Object.freeze([1, 2, 3, 4, 6, 12] as CalendarSlidingWindowMonth[]);

export const assertSafeInteger = (value: any) => {
    if (!Number.isSafeInteger(value)) throw new TypeError('EXPECTS_SAFE_INTEGER');
};

export const mod = (num: number, modulo: number) => {
    assertSafeInteger(num);
    assertSafeInteger(modulo);
    const mod = num % modulo;
    return mod > 0 ? mod : (mod + modulo) % modulo;
};

export const getNoonTimestamp = (date: CalendarDate = Date.now(), useNoonTodayAsFallback = false) => {
    let timestamp: Date;
    try {
        timestamp = new Date(date);
    } catch (ex) {
        if (useNoonTodayAsFallback) timestamp = new Date();
        else throw ex;
    }
    return timestamp.setHours(12, 0, 0, 0);
};

export const getMonthTimestamp = (date: CalendarDate = Date.now(), offset = 0) => {
    assertSafeInteger(offset);
    const noonTimestamp = new Date(getNoonTimestamp(date));
    return noonTimestamp.setMonth(noonTimestamp.getMonth() + offset, 1);
};

export const getMonthEndDate = (date: CalendarDate = Date.now(), offset = 0) => (
    new Date(getMonthTimestamp(date, offset + 1) - DAY_MS).getDate() as CalendarMonthEndDate
);

export const getMonthFirstDayOffset = (firstWeekDay: CalendarFirstWeekDay = 0, date: CalendarDate = Date.now(), offset = 0) => {
    const monthFirstDay = new Date(getMonthTimestamp(date, offset)).getDay() as CalendarDay;
    return mod(monthFirstDay - firstWeekDay + 7, 7) as CalendarDay;
};

export const getWeekendDays = (firstWeekDay: CalendarFirstWeekDay = 0) => Object.freeze(
    WEEKEND_DAYS_SEED.map(seed => mod(6 - firstWeekDay + seed, 7)) as [CalendarDay, CalendarDay]
);

export const getRelativeMonthOffset = (originTimestamp: number, timestamp: number) => {
    const date = new Date(timestamp);
    const origin = new Date(originTimestamp);
    return (date.getMonth() - origin.getMonth()) + (date.getFullYear() - origin.getFullYear()) * 12;
};

export const getMinimumNearestCalendarMonths = (calendarMonths: CalendarMonth = 1) => {
    if (CALENDAR_WINDOW_MONTHS.includes(calendarMonths as CalendarSlidingWindowMonth)) {
        return calendarMonths as CalendarSlidingWindowMonth;
    }

    let min = 0;
    let max = CALENDAR_WINDOW_MONTHS.length;

    while (min < max) {
        const mid = min + Math.floor((max - min) / 2);
        if ((CALENDAR_WINDOW_MONTHS[mid] as CalendarSlidingWindowMonth) > calendarMonths) max = mid - 1;
        else min = mid;
    }

    return CALENDAR_WINDOW_MONTHS[min] as CalendarSlidingWindowMonth;
};

export const getCalendarTimeSliceParameters = ({ calendarMonths = 1, originDate, sinceDate, untilDate }: CalendarConfig, offset: number) => {
    const noonTimestamp = getNoonTimestamp(originDate, true);
    const relativeOriginDateIndex = new Date(noonTimestamp).getDate() - 1;

    let calendarStartMonthOffset = offset;
    let maxOffset = Infinity;
    let minOffset = -Infinity;
    let numberOfMonths = calendarMonths;
    let originTimestamp = getMonthTimestamp(noonTimestamp);

    try { getMonthTimestamp(originDate, offset); }
    catch { calendarStartMonthOffset = 0; }

    if (sinceDate !== undefined) {
        const timestamp = getMonthTimestamp(sinceDate);
        if ((minOffset = getRelativeMonthOffset(originTimestamp, timestamp)) >= 0) originTimestamp = timestamp;
    }

    if (untilDate !== undefined) {
        const timestamp = getMonthTimestamp(untilDate);
        if ((maxOffset = getRelativeMonthOffset(originTimestamp, timestamp)) <= 0) originTimestamp = timestamp;
    }

    if (maxOffset < minOffset) throw new RangeError('INVALID_TIME_SLICE');

    calendarStartMonthOffset = Math.max(minOffset, Math.min(calendarStartMonthOffset, maxOffset));

    const offsetMonth = new Date(getMonthTimestamp(originTimestamp, calendarStartMonthOffset)).getMonth() as CalendarMonth;
    const computedCalendarFrameEndOffset = calendarStartMonthOffset - (offsetMonth % calendarMonths) + calendarMonths - 1;

    numberOfMonths = getMinimumNearestCalendarMonths(Math.min(numberOfMonths, maxOffset - minOffset + 1) as CalendarMonth);
    calendarStartMonthOffset = Math.min(maxOffset, computedCalendarFrameEndOffset) - numberOfMonths + 1;
    maxOffset -= numberOfMonths - 1;

    return [numberOfMonths, originTimestamp, minOffset, maxOffset, calendarStartMonthOffset, relativeOriginDateIndex] as const;
};
