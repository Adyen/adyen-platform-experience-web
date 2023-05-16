export type CalendarDate = Date | number | string;
export type CalendarFirstWeekDay = 0 | 1;
export type CalendarDay = CalendarFirstWeekDay | 2 | 3 | 4 | 5 | 6;
export type CalendarMonth = CalendarDay | 7 | 8 | 9 | 10 | 11;
export type CalendarSlidingWindowMonth = 1 | 2 | 3 | 4 | 6 | 12;
export type CalendarMonthEndDate = 28 | 29 | 30 | 31;

export const enum CalendarShift {
    MONTH = 'MONTH',
    WINDOW = 'WINDOW',
    YEAR = 'YEAR'
}

export interface CalendarIterable<IteratorValue> extends Iterable<IteratorValue> {
    [index: number]: IteratorValue;
    map: CalendarMapIteratorFactory<IteratorValue>;
    size: number;
}

export type CalendarMapIteratorCallback<IteratorValue, MappedValue = any> = (
    item: CalendarIterable<IteratorValue>[number],
    index: number,
    context: CalendarIterable<IteratorValue>
) => MappedValue;

export type CalendarMapIteratorFactory<IteratorValue, MappedValue = any> = (
    this: CalendarIterable<IteratorValue>,
    callback?: CalendarMapIteratorCallback<IteratorValue, MappedValue>,
    thisArg?: any
) => Generator<MappedValue>;

export interface CalendarDaysView extends CalendarIterable<string> {
    isFirstWeekDayAt: (index: number) => boolean;
    isWeekendAt: (index: number) => boolean;
}

export interface CalendarMonthDaysView extends CalendarDaysView {
    isWithinMonthAt: (index: number) => boolean;
}

export interface CalendarWeekView extends CalendarDaysView {
    isTransitionWeek: boolean;
}

export interface CalendarMonthWeekView extends CalendarMonthDaysView, CalendarWeekView {}

export interface CalendarMonthView extends CalendarMonthDaysView {
    intersectsWithNext: boolean;
    intersectsWithPrev: boolean;
    month: number;
    weeks: CalendarIterable<CalendarMonthWeekView>;
    year: number;
}

export interface CalendarView extends CalendarDaysView {
    months: CalendarIterable<CalendarMonthView>;
    weeks: CalendarIterable<CalendarWeekView>;
}

export interface CalendarConfig {
    calendarMonths?: CalendarSlidingWindowMonth;
    dynamicMonthWeeks?: boolean;
    firstWeekDay?: CalendarFirstWeekDay;
    locale?: string;
    originDate?: CalendarDate;
    sinceDate?: CalendarDate;
    untilDate?: CalendarDate;
}

export interface CalendarProps extends CalendarConfig {
    allowSelection?: boolean;
    explicitWeeks?: boolean;
    getCustomRenderProps?: () => void;
    onlyMonthDays?: boolean;
    trackCurrentDay?: boolean;
}
