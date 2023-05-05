export type CalendarDate = Date | number | string;
export type CalendarDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CalendarMonth = CalendarDay | 7 | 8 | 9 | 10 | 11;
export type CalendarSlidingWindowMonths = 1 | 2 | 3 | 4 | 6 | 12;
export type CalendarMonthEndDate = 28 | 29 | 30 | 31;

export interface CalendarSlidingWindow {
    days: number;
    offsets: Readonly<[number, number, number, number]>[];
    timestamp: number;
}

export interface UseCalendarConfig {
    calendarMonths?: CalendarSlidingWindowMonths;
    firstWeekDay?: CalendarDay;
    startDate?: CalendarDate;
}
