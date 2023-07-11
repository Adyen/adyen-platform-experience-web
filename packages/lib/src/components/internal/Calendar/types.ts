import { Attributes, ClassAttributes, ComponentChild, ComponentChildren, ComponentType, JSX } from 'preact';

export type CalendarDate = Date | number | string;
export type CalendarFirstWeekDay = 0 | 1;
export type CalendarDay = CalendarFirstWeekDay | 2 | 3 | 4 | 5 | 6;
export type CalendarMonth = CalendarDay | 7 | 8 | 9 | 10 | 11;
export type CalendarSlidingWindowMonth = 1 | 2 | 3 | 4 | 6 | 12;
export type CalendarMonthEndDate = 28 | 29 | 30 | 31;

export const enum CalendarFlag {
    WEEK_START = 0x1,
    WEEK_END = 0x2,
    WEEKEND = 0x4,
    TODAY = 0x8,
    MONTH_START = 0x10,
    MONTH_END = 0x20,
    WITHIN_MONTH = 0x40,
    RANGE_START = 0x100,
    RANGE_END = 0x200,
    WITHIN_RANGE = 0x400,
    SELECTION_START = 0x1000,
    SELECTION_END = 0x2000,
    WITHIN_SELECTION = 0x4000,
    FAUX_SELECTION_START = 0x10000,
    FAUX_SELECTION_END = 0x20000,
    WITHIN_FAUX_SELECTION = 0x40000,
}

export const enum CalendarRenderToken {
    DATE,
    DAY_OF_WEEK,
    MONTH_HEADER,
}

export const enum CalendarSelectionSnap {
    FARTHEST_EDGE,
    NEAREST_EDGE,
    START_EDGE,
    END_EDGE,
}

export const enum CalendarCursorShift {
    FIRST_MONTH_DAY = 'FIRST_MONTH_DAY',
    LAST_MONTH_DAY = 'LAST_MONTH_DAY',
    FIRST_WEEK_DAY = 'FIRST_WEEK_DAY',
    LAST_WEEK_DAY = 'LAST_WEEK_DAY',
    PREV_WEEK_DAY = 'PREV_WEEK_DAY',
    NEXT_WEEK_DAY = 'NEXT_WEEK_DAY',
    PREV_MONTH = 'PREV_MONTH',
    NEXT_MONTH = 'NEXT_MONTH',
    PREV_WEEK = 'PREV_WEEK',
    NEXT_WEEK = 'NEXT_WEEK',
}

export const enum CalendarShift {
    MONTH = 'MONTH',
    WINDOW = 'WINDOW',
    YEAR = 'YEAR',
}

export const enum CalendarTraversal {
    PREV = 'PREV',
    NEXT = 'NEXT',
    PREV_WINDOW = 'PREV_WINDOW',
    NEXT_WINDOW = 'NEXT_WINDOW',
    PREV_YEAR = 'PREV_YEAR',
    NEXT_YEAR = 'NEXT_YEAR',
}

export const enum CalendarTraversalControls {
    CONDENSED = 'CONDENSED',
    EXPANDED = 'EXPANDED',
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

export interface CalendarWeekView extends CalendarIterable<number> {
    isTransitionWeek: boolean;
}

export interface CalendarMonthView extends CalendarIterable<number> {
    days: CalendarMonthEndDate;
    displayName: string;
    end: number;
    intersectsWithNext: boolean;
    intersectsWithPrev: boolean;
    origin: number;
    month: number;
    start: number;
    weeks: CalendarIterable<CalendarWeekView>;
    year: number;
}

export interface CalendarView extends CalendarIterable<[string, string] | null> {
    cursorPosition: number;
    daysOfWeek: CalendarIterable<readonly [string, string, string]>;
    firstWeekDay: CalendarFirstWeekDay;
    months: CalendarIterable<CalendarMonthView>;
    shift: (monthOffset: number, shift?: CalendarShift) => void;
    shiftCursor: (shift?: CalendarCursorShift | number) => void;
    weekendDays: Readonly<[CalendarDay, CalendarDay] | CalendarDay[]>;
    weeks: CalendarIterable<CalendarWeekView>;
}

export interface CalendarConfig {
    calendarMonths?: CalendarSlidingWindowMonth;
    dynamicMonthWeeks?: boolean;
    firstWeekDay?: CalendarFirstWeekDay;
    locale?: string;
    onlyMonthDays?: boolean;
    originDate?: CalendarDate;
    sinceDate?: CalendarDate;
    untilDate?: CalendarDate;
    watch?: (...args: any[]) => any;
}

export interface CalendarProps extends CalendarConfig {
    offset?: number;
    onSelected?: (date: any) => void;
    render?: CalendarRenderer<{
        children?: ComponentChildren[] | ComponentChildren;
        props?: CalendarRenderProps;
        type?: keyof JSX.IntrinsicElements | ComponentType | string;
    }>;
    renderControl?: (traversal: CalendarTraversal, controlRootProps: CalendarTraversalControlRootProps) => ComponentChild;
    trackToday?: boolean;
    traversalControls?: CalendarTraversalControls;
}

export interface CalendarCursorRootProps {
    onClickCapture: (evt: Event) => void;
    onKeyDownCapture: (evt: KeyboardEvent) => void;
}

export interface CalendarTraversalControlRootProps {
    key: any;
    onClick: (evt: Event) => void;
}

export type CalendarRenderProps =
    | (ClassAttributes<any> & (JSX.DOMAttributes<any> | JSX.SVGAttributes<any>))
    | (Attributes & Record<string, any>)
    | null;

export interface CalendarRenderTokenContext {
    [CalendarRenderToken.DATE]: {
        className?: string;
        displayDate: string;
        dateTime: string;
        dateTimeClassName?: string;
        dateTimeProps?: CalendarRenderProps;
        flags: number;
        props?: CalendarRenderProps;
    };
    [CalendarRenderToken.DAY_OF_WEEK]: {
        className?: string;
        flags: number;
    };
    [CalendarRenderToken.MONTH_HEADER]: {};
}

export type CalendarRenderer<T = ComponentChild> = (
    token: CalendarRenderToken,
    ctx: CalendarRenderTokenContext[CalendarRenderToken],
    render?: CalendarProps['render']
) => T;
