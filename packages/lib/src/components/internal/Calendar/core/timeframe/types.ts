import {
    MONTH_SIZES,
    SHIFT_FRAME,
    SHIFT_MONTH,
    SHIFT_YEAR,
    SIZE_MONTH_1,
    SIZE_MONTH_12,
    SIZE_MONTH_2,
    SIZE_MONTH_3,
    SIZE_MONTH_4,
    SIZE_MONTH_6,
} from './constants';
import { Month, WeekDay } from '../shared/types';
import { TimeSlice } from '../timeslice/types';

export type TimeFrameShift = typeof SHIFT_FRAME | typeof SHIFT_MONTH | typeof SHIFT_YEAR;
export type TimeFrameMonthSize = (typeof MONTH_SIZES)[number];
export type TimeFrameSize =
    | typeof SIZE_MONTH_1
    | typeof SIZE_MONTH_2
    | typeof SIZE_MONTH_3
    | typeof SIZE_MONTH_4
    | typeof SIZE_MONTH_6
    | typeof SIZE_MONTH_12
    | TimeFrameMonthSize;

export type TimeFrame = {
    readonly days: number;
    get firstWeekDay(): WeekDay;
    set firstWeekDay(day: WeekDay | null | undefined);
    readonly months: TimeFrameMonth[];
    get size(): TimeFrameMonthSize;
    set size(size: TimeFrameSize | null | undefined);
    readonly shift: (offset?: number, shift?: TimeFrameShift) => TimeFrame;
    get timeslice(): TimeSlice;
    set timeslice(timeslice: TimeSlice | null | undefined);
    readonly timestamp: number;
    readonly weeks: number;
};

export type TimeFrameMonth = {
    readonly [K: number]: number | undefined;
    readonly days: number;
    readonly flags: { readonly [K: number]: number | undefined };
    readonly month: Month;
    readonly startTimestamp: number;
    readonly weeks: number;
    readonly year: number;
};

export type TimeFrameFactory = {
    (size?: TimeFrameSize): TimeFrame;
    readonly MONTH: typeof SIZE_MONTH_1;
    readonly MONTH_1: typeof SIZE_MONTH_1;
    readonly MONTH_2: typeof SIZE_MONTH_2;
    readonly MONTH_3: typeof SIZE_MONTH_3;
    readonly MONTH_4: typeof SIZE_MONTH_4;
    readonly MONTH_6: typeof SIZE_MONTH_6;
    readonly MONTH_12: typeof SIZE_MONTH_12;
    readonly SHIFT_FRAME: typeof SHIFT_FRAME;
    readonly SHIFT_MONTH: typeof SHIFT_MONTH;
    readonly SHIFT_YEAR: typeof SHIFT_YEAR;
    readonly YEAR: typeof SIZE_MONTH_12;
};
