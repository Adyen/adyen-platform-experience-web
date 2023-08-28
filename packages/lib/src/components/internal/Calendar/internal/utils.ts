import unsignedModulo from '../../../../utils/unsignedModulo';
import {
    CalendarConfig,
    CalendarDate,
    CalendarDay,
    CalendarFirstWeekDay,
    CalendarMonth,
    CalendarMonthEndDate,
    CalendarSlidingWindowMonth,
} from '../types.old';
import calendar from '@src/components/internal/Calendar/calendar';

export const DAY_MS = 86400000;
export const CALENDAR_WINDOW_MONTHS = [1, 2, 3, 4, 4, 6, 6, 6, 6, 6, 6, 12] as const;
export const DAY_OF_WEEK_FORMATS = ['long', 'short', 'narrow'] as const;
export const WEEKEND_DAYS_SEED = [0, 1] as const;

const { grid } = calendar(() => {
    // console.clear();
    //
    // for (let i = 0; i < grid.length; i++) {
    //     const frameBlock = grid[i] as typeof grid[number];
    //
    //     console.log(`%c${frameBlock.label}`, 'color:pink;font-weight:bold;', "\n");
    //     console.log(`%c${Array.from(grid.daysOfWeek, ({ labels }) => labels.short).join(' ')}`, 'color:khaki;');
    //
    //     for (let i = 0; i < frameBlock.length; i++) {
    //         const row = frameBlock[i] as typeof frameBlock[number];
    //
    //         console.log(...Array.from({ length: row?.length ?? 0 }, (_, index) => {
    //             const { flags, label } = row?.[index] as typeof row[number];
    //             return `0${
    //                 !(flags.WITHIN_BLOCK)
    //                     ? '--'
    //                     : (flags.CURSOR)
    //                         ? '//'
    //                         : (flags.WITHIN_SELECTION)
    //                             ? '=='
    //                             : label
    //             } `.slice(-3);
    //         }));
    //     }
    //
    //     console.log("\n");
    // }
});

grid.config({
    // blocks: 2,
    // blocks: 3,
    // blocks: 4,
    // blocks: 6,
    // blocks: 12,
    firstWeekDay: 1,
    // timeslice: calendar.range.SINCE_NOW,
    // timeslice: calendar.range.UNTIL_NOW,
    timeslice: calendar.range('2022-12-10', '2023-10-10'),
});

document.body.addEventListener('keydown', evt => {
    grid.cursor(evt) && evt.preventDefault();
});

// grid.shift(-2);
// grid.highlight.from = new Date().setDate(-10);

// grid.cursor = calendar.cursor.FORWARD;
// grid.cursor = calendar.cursor.FORWARD;
// grid.cursor = calendar.cursor.FORWARD;
// grid.cursor = calendar.cursor.FORWARD;
// grid.cursor = calendar.cursor.FORWARD;
// grid.cursor = calendar.cursor.UPWARD;
// grid.cursor = calendar.cursor.BACKWARD;
// grid.cursor = calendar.cursor.BACKWARD;
// grid.cursor = calendar.cursor.BACKWARD;
// grid.cursor = calendar.cursor.UPWARD;
// grid.cursor = calendar.cursor.ROW_START;
// grid.cursor = calendar.cursor.DOWNWARD;
// grid.cursor = calendar.cursor.DOWNWARD;
// grid.cursor = calendar.cursor.ROW_END;
// grid.cursor = calendar.cursor.BLOCK_END;
// grid.cursor = calendar.cursor.ROW_END;
// grid.cursor = calendar.cursor.BLOCK_END;
// grid.cursor = calendar.cursor.ROW_START;
// grid.cursor = calendar.cursor.ROW_END;
// grid.cursor = calendar.cursor.DOWNWARD;
// grid.cursor = calendar.cursor.BLOCK_START;
// grid.cursor = calendar.cursor.BLOCK_END;
// grid.cursor = calendar.cursor.NEXT_BLOCK;
// grid.cursor = calendar.cursor.PREV_BLOCK;
// grid.cursor = calendar.cursor.PREV_BLOCK;

export const assertSafeInteger = (value: any) => {
    if (!Number.isSafeInteger(value)) throw new TypeError('EXPECTS_SAFE_INTEGER');
};

export const withRelativeIndexFactory =
    (indexOffset = 0, indexCallback: (currentIndex: number, initialIndex: number) => any = x => x) =>
    (index: number) =>
        indexCallback(indexOffset + index, index);

export const mod = (num: number, modulo: number) => {
    assertSafeInteger(num);
    assertSafeInteger(modulo);
    return unsignedModulo(num, modulo);
};

export const getTimestamp = (date: CalendarDate = Date.now(), useTodayAsFallback = false) => {
    let timestamp: Date;
    try {
        timestamp = new Date(date);
    } catch (ex) {
        if (useTodayAsFallback) timestamp = new Date();
        else throw ex;
    }
    return timestamp.setHours(0, 0, 0, 0);
};

export const getMonthTimestamp = (date: CalendarDate = Date.now(), offset = 0) => {
    assertSafeInteger(offset);
    const timestamp = new Date(getTimestamp(date));
    return timestamp.setMonth(timestamp.getMonth() + offset, 1);
};

export const getMonthEndDate = (date: CalendarDate = Date.now(), offset = 0) =>
    new Date(new Date(getMonthTimestamp(date, offset + 1)).setDate(0)).getDate() as CalendarMonthEndDate;

export const getMonthFirstDayOffset = (firstWeekDay: CalendarFirstWeekDay = 0, date: CalendarDate = Date.now(), offset = 0) => {
    const monthFirstDay = new Date(getMonthTimestamp(date, offset)).getDay() as CalendarDay;
    return mod(monthFirstDay - firstWeekDay + 7, 7) as CalendarDay;
};

export const getWeekendDays = (firstWeekDay: CalendarFirstWeekDay = 0) =>
    Object.freeze(WEEKEND_DAYS_SEED.map(seed => mod(6 - firstWeekDay + seed, 7)) as [CalendarDay, CalendarDay]);

export const getRelativeMonthOffset = (originTimestamp: number, timestamp: number) => {
    const date = new Date(timestamp);
    const origin = new Date(originTimestamp);
    return date.getMonth() - origin.getMonth() + (date.getFullYear() - origin.getFullYear()) * 12;
};

export const getMinimumNearestCalendarMonths = (calendarMonths: CalendarMonth = 1) => {
    return CALENDAR_WINDOW_MONTHS[calendarMonths - 1] as CalendarSlidingWindowMonth;
};

export const getCalendarTimeSliceParameters = ({ calendarMonths = 1, originDate, sinceDate, untilDate }: CalendarConfig, offset: number) => {
    const timestamp = getTimestamp(originDate, true);
    const relativeOriginDateIndex = new Date(timestamp).getDate() - 1;

    let calendarStartMonthOffset = offset;
    let maxOffset = Infinity;
    let minOffset = -Infinity;
    let numberOfMonths = calendarMonths;
    let originTimestamp = getMonthTimestamp(timestamp);

    try {
        getMonthTimestamp(originDate, offset);
    } catch {
        calendarStartMonthOffset = 0;
    }

    if (sinceDate !== undefined && untilDate !== undefined) {
        const sinceTimestamp = getMonthTimestamp(sinceDate);
        const untilTimestamp = getMonthTimestamp(untilDate);
        const minRelativeMonthOffset = getRelativeMonthOffset(originTimestamp, sinceTimestamp);
        const maxRelativeMonthOffset = getRelativeMonthOffset(originTimestamp, untilTimestamp);

        if (minRelativeMonthOffset >= 0) {
            originTimestamp = sinceTimestamp;
            maxOffset = Math.max(0, maxRelativeMonthOffset - minRelativeMonthOffset);
            minOffset = 0;
        } else if (maxRelativeMonthOffset <= 0) {
            originTimestamp = untilTimestamp;
            maxOffset = 0;
            minOffset = Math.min(0, minRelativeMonthOffset - maxRelativeMonthOffset);
        } else {
            maxOffset = maxRelativeMonthOffset;
            minOffset = minRelativeMonthOffset;
        }
    } else if (sinceDate !== undefined) {
        const timestamp = getMonthTimestamp(sinceDate);
        const relativeMonthOffset = getRelativeMonthOffset(originTimestamp, timestamp);

        if (relativeMonthOffset >= 0) originTimestamp = timestamp;
        minOffset = Math.min(0, relativeMonthOffset);
    } else if (untilDate !== undefined) {
        const timestamp = getMonthTimestamp(untilDate);
        const relativeMonthOffset = getRelativeMonthOffset(originTimestamp, timestamp);

        if (relativeMonthOffset <= 0) originTimestamp = timestamp;
        maxOffset = Math.max(0, relativeMonthOffset);
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
