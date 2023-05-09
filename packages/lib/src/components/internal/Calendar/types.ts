export type CalendarDate = Date | number | string;
export type CalendarFirstWeekDay = 0 | 1;
export type CalendarDay = CalendarFirstWeekDay | 2 | 3 | 4 | 5 | 6;
export type CalendarMonth = CalendarDay | 7 | 8 | 9 | 10 | 11;
export type CalendarSlidingWindowMonth = 1 | 2 | 3 | 4 | 6 | 12;
export type CalendarMonthEndDate = 28 | 29 | 30 | 31;

export type CalendarMonthView = Iterable<string> & {
    [index: number]: string;
    isFirstWeekDayAt: (index: number) => boolean;
    isWeekendAt: (index: number) => boolean;
    isWithinMonthAt: (index: number) => boolean;
    month: number;
    year: number;
};

export interface CalendarSlidingWindow {
    dates: string[];
    offsets: Readonly<[number, number, number]>[];
}

export interface UseCalendarConfig {
    calendarMonths?: CalendarSlidingWindowMonth;
    firstWeekDay?: CalendarFirstWeekDay;
    startDate?: CalendarDate;
}
