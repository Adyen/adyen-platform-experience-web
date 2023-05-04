export type CalendarDate = Date | number | string;
export type CalendarDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CalendarMonth = CalendarDay | 7 | 8 | 9 | 10 | 11;
export type CalendarSlidingWindowMonths = 1 | 2 | 3 | 4 | 6 | 12;
export type CalendarMonthEndDate = 28 | 29 | 30 | 31;

export const DAY_MS = 86400000;

const assertCalendarOffset = (offset: number) => {
    if (!Number.isSafeInteger(offset)) throw new TypeError('INVALID_OFFSET');
};

export const getMonthStart = (date: CalendarDate = Date.now(), offset = 0) => {
    assertCalendarOffset(offset);
    const calendarDate = new Date(new Date(date).setHours(0, 0, 0, 0)); // @ts-ignore
    return calendarDate.setMonth(calendarDate.getMonth() + offset, 1);
};

export const getMonthEndDate = (date: CalendarDate = Date.now(), offset = 0) => (
    new Date(getMonthStart(date, offset + 1) - 1).getDate() as CalendarMonthEndDate
);

export const getMonthStartDayOffset = (firstWeekDay: CalendarDay = 0, date: CalendarDate = Date.now(), offset = 0) => {
    const monthStartDay = new Date(getMonthStart(date, offset)).getDay() as CalendarDay;
    return (monthStartDay - firstWeekDay + 7) % 7 as CalendarDay;
};

export const getCalendarSlidingWindow = (months: CalendarSlidingWindowMonths = 1, date: CalendarDate = Date.now(), offset = 0) => {
    const calendarMonth = new Date(getMonthStart(date, offset)).getMonth() as CalendarMonth;
    return [Math.floor(calendarMonth / months) * months, calendarMonth % months] as const;
};
