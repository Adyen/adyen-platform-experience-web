export type CalendarDate = Date | number | string;
export type CalendarFirstWeekDay = 0 | 1;
export type CalendarDay = CalendarFirstWeekDay | 2 | 3 | 4 | 5 | 6;
export type CalendarMonth = CalendarDay | 7 | 8 | 9 | 10 | 11;
export type CalendarSlidingWindowMonth = 1 | 2 | 3 | 4 | 6 | 12;
export type CalendarMonthEndDate = 28 | 29 | 30 | 31;

export type CalendarIterable<IteratorValue = any> = Iterable<IteratorValue> & {
    [index: number]: IteratorValue;
    map: CalendarMapIteratorFactory<IteratorValue>;
    size: number;
}

export type CalendarMapIteratorCallback<IteratorValue = any, MappedValue = any> = (
    item: CalendarIterable<IteratorValue>[number],
    index: number,
    month: CalendarIterable<IteratorValue>
) => MappedValue;

export type CalendarMapIteratorFactory<IteratorValue = any, MappedValue = any> = (
    this: CalendarIterable<IteratorValue>,
    callback?: CalendarMapIteratorCallback<IteratorValue, MappedValue>,
    thisArg?: any
) => Generator<MappedValue>;

export type CalendarMonthView = CalendarIterable<string> & {
    // isFirstWeekDayAt: (index: number) => boolean;
    // isWeekendAt: (index: number) => boolean;
    // isWithinMonthAt: (index: number) => boolean;
    month: number;
    year: number;
};

export interface UseCalendarConfig {
    calendarMonths?: CalendarSlidingWindowMonth;
    firstWeekDay?: CalendarFirstWeekDay;
    startDate?: CalendarDate;
}

export interface CalendarProps extends UseCalendarConfig {
    renderMonth?: CalendarMapIteratorCallback<CalendarMonthView>;
}
