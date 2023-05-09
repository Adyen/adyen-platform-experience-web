import {
    CalendarDate,
    CalendarDay,
    CalendarFirstWeekDay,
    CalendarMonth,
    CalendarMonthEndDate,
    CalendarSlidingWindowMonth
} from './types';

export const DAY_MS = 86400000;
export const MONTH_DAYS = 42;

const WEEKEND_DAYS_SEED = Object.freeze([0, 1] as const);

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
    const noonTimestamp = new Date(getNoonTimestamp(date)); // @ts-ignore
    return noonTimestamp.setMonth(noonTimestamp.getMonth() + offset, 1);
};

export const getMonthEndDate = (date: CalendarDate = Date.now(), offset = 0) => (
    new Date(getMonthTimestamp(date, offset + 1) - DAY_MS).getDate() as CalendarMonthEndDate
);

export const getMonthFirstDayOffset = (firstWeekDay: CalendarFirstWeekDay = 0, date: CalendarDate = Date.now(), offset = 0) => {
    const monthFirstDay = new Date(getMonthTimestamp(date, offset)).getDay() as CalendarDay;
    return mod(monthFirstDay - firstWeekDay + 7, 7) as CalendarDay;
};

export const getCalendarSlidingWindow = (months: CalendarSlidingWindowMonth = 1, date: CalendarDate = Date.now(), offset = 0) => {
    const dateMonth = new Date(getMonthTimestamp(date, offset)).getMonth() as CalendarMonth;
    return [Math.floor(dateMonth / months) * months, dateMonth % months] as const;
};

export const getWeekendDays = (firstWeekDay: CalendarFirstWeekDay = 0) => Object.freeze(
    WEEKEND_DAYS_SEED.map(seed => mod(6 - firstWeekDay + seed, 7)) as [CalendarDay, CalendarDay]
);
