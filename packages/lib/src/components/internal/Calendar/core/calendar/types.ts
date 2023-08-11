import {
    CURSOR_BACKWARD,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_LINE_END,
    CURSOR_LINE_START,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    FIRST_WEEK_DAYS,
    FRAME_SIZES,
    RANGE_FROM,
    RANGE_TO,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
    SELECTION_COLLAPSE,
    SELECTION_FARTHEST,
    SELECTION_FROM,
    SELECTION_NEAREST,
    SELECTION_TO,
} from './constants';
import { Watchable } from '../shared/watchable/types';

type WithTimeEdges<T = {}> = {
    readonly from: T;
    readonly to: T;
};

export type Today = {
    readonly timestamp: number;
    readonly watch: Watchable<{}>['watch'];
};

export type Time = Date | number | string;
export type FirstWeekDay = (typeof FIRST_WEEK_DAYS)[number];
export type WeekDay = FirstWeekDay | 2 | 3 | 4 | 5;
export type Month = WeekDay | 7 | 8 | 9 | 10 | 11;
export type MonthDays = 28 | 29 | 30 | 31;

export const enum TimeFlag {
    WEEK_START = 0x1,
    WEEK_END = 0x2,
    WEEKEND = 0x4,
    TODAY = 0x8,
    BLOCK_START = 0x10,
    BLOCK_END = 0x20,
    WITHIN_BLOCK = 0x40,
    CURSOR = 0x80,
    RANGE_START = 0x100,
    RANGE_END = 0x200,
    WITHIN_RANGE = 0x400,
    SELECTION_START = 0x1000,
    SELECTION_END = 0x2000,
    WITHIN_SELECTION = 0x4000,
}

export type TimeFrameCursor =
    | typeof CURSOR_BACKWARD
    | typeof CURSOR_BLOCK_END
    | typeof CURSOR_BLOCK_START
    | typeof CURSOR_DOWNWARD
    | typeof CURSOR_FORWARD
    | typeof CURSOR_LINE_END
    | typeof CURSOR_LINE_START
    | typeof CURSOR_NEXT_BLOCK
    | typeof CURSOR_PREV_BLOCK
    | typeof CURSOR_UPWARD;

export type TimeFrameRangeEdge = typeof RANGE_FROM | typeof RANGE_TO;

export type TimeFrameSelection =
    | typeof SELECTION_COLLAPSE
    | typeof SELECTION_FARTHEST
    | typeof SELECTION_FROM
    | typeof SELECTION_NEAREST
    | typeof SELECTION_TO;

export type TimeFrameShift = typeof SHIFT_BLOCK | typeof SHIFT_FRAME | typeof SHIFT_PERIOD;

export type TimeFrameSize = (typeof FRAME_SIZES)[number];

export type TimeFrameAtoms = {
    cells: number;
    cursor: number;
    length: TimeFrameSize;
    originTimestamp: number;
    todayTimestamp: number;
};

export type TimeFrame = {
    [K: number]: TimeFrameMonth;
    readonly index: (index: number) => number;
    readonly cells: number;
    get cursor(): number;
    set cursor(shift: TimeFrameCursor | number);
    get firstWeekDay(): FirstWeekDay;
    set firstWeekDay(day: FirstWeekDay | null | undefined);
    get length(): TimeFrameSize;
    set length(length: TimeFrameSize | null | undefined);
    readonly select: (time: Time, selection?: TimeFrameSelection) => void;
    readonly selection: {
        get from(): number | undefined;
        set from(time: Time | null | undefined);
        get to(): number | undefined;
        set to(time: Time | null | undefined);
    };
    readonly shift: (offset?: number, shift?: TimeFrameShift) => void;
    get timeslice(): TimeSlice;
    set timeslice(timeslice: TimeSlice | null | undefined);
    readonly watch: Watchable<TimeFrameAtoms>['watch'];
    readonly width: number;
};

export type TimeFrameMonth = {
    readonly [K: number]: number;
    readonly flags: { readonly [K: number]: number };
    readonly index: number;
    readonly length: number;
    readonly month: Month;
    readonly year: number;
};

type BlockMetrics<T extends string> = {
    [K in T]: WithTimeEdges<number> & { readonly units: number };
};

export type TimeFrameBlockMetrics = BlockMetrics<'inner' | 'outer'> & {
    readonly [K: number]: number;
    readonly flags: { readonly [K: number]: number };
    readonly month: Month;
    readonly year: number;
};

export type TimeFrameMonthMetrics = [Month, number, number, number, number];

export type TimeFrameFactory = {
    (length?: TimeFrameSize): TimeFrame;
    readonly CURSOR_BACKWARD: typeof CURSOR_BACKWARD;
    readonly CURSOR_BLOCK_END: typeof CURSOR_BLOCK_END;
    readonly CURSOR_BLOCK_START: typeof CURSOR_BLOCK_START;
    readonly CURSOR_DOWNWARD: typeof CURSOR_DOWNWARD;
    readonly CURSOR_FORWARD: typeof CURSOR_FORWARD;
    readonly CURSOR_LINE_END: typeof CURSOR_LINE_END;
    readonly CURSOR_LINE_START: typeof CURSOR_LINE_START;
    readonly CURSOR_NEXT_BLOCK: typeof CURSOR_NEXT_BLOCK;
    readonly CURSOR_PREV_BLOCK: typeof CURSOR_PREV_BLOCK;
    readonly CURSOR_UPWARD: typeof CURSOR_UPWARD;
    readonly SHIFT_BLOCK: typeof SHIFT_BLOCK;
    readonly SHIFT_FRAME: typeof SHIFT_FRAME;
    readonly SHIFT_PERIOD: typeof SHIFT_PERIOD;
};

export type TimeSlice = WithTimeEdges<number> & {
    readonly offsets: WithTimeEdges<number>;
    readonly span: number;
};

export type TimeSliceFactory = {
    (fromTime?: Time, toTime?: Time): TimeSlice;
    (time?: Time, timeEdge?: TimeFrameRangeEdge): TimeSlice;
};
