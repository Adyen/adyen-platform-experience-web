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
    NOW,
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
    TODAY = 0x1,
    CURSOR = 0x2,
    WEEKEND = 0x4,
    LINE_START = 0x8,
    LINE_END = 0x10,
    WITHIN_BLOCK = 0x20,
    BLOCK_START = 0x40,
    BLOCK_END = 0x80,
    WITHIN_RANGE = 0x100,
    RANGE_START = 0x200,
    RANGE_END = 0x400,
    WITHIN_SELECTION = 0x800,
    SELECTION_START = 0x1000,
    SELECTION_END = 0x2000,
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

export type TimeFrameSelection =
    | typeof SELECTION_COLLAPSE
    | typeof SELECTION_FARTHEST
    | typeof SELECTION_FROM
    | typeof SELECTION_NEAREST
    | typeof SELECTION_TO;

export type TimeFrameRangeEdge = typeof RANGE_FROM | typeof RANGE_TO;
export type TimeFrameShift = typeof SHIFT_BLOCK | typeof SHIFT_FRAME | typeof SHIFT_PERIOD;
export type TimeFrameSize = (typeof FRAME_SIZES)[number];

type TimeFrameBlockMetrics<T extends string> = {
    [K in T]: WithTimeEdges<number> & { readonly units: number };
};

export type TimeFrameBlock = TimeFrameBlockMetrics<'inner' | 'outer'> & {
    readonly [K: number]: readonly [number, number];
    readonly month: Month;
    readonly year: number;
};

export type TimeFrame = {
    [K: number]: TimeFrameBlock;
    get cursor(): number;
    set cursor(shift: TimeFrameCursor | number);
    get firstWeekDay(): FirstWeekDay;
    set firstWeekDay(day: FirstWeekDay | null | undefined);
    readonly highlight: {
        (time: Time, selection?: TimeFrameSelection): void;
        get from(): number | undefined;
        set from(time: Time | null | undefined);
        get to(): number | undefined;
        set to(time: Time | null | undefined);
    };
    readonly length: number;
    readonly lineWidth: number;
    readonly shift: (offset?: number, shift?: TimeFrameShift) => void;
    get size(): TimeFrameSize;
    set size(length: TimeFrameSize | null | undefined);
    get timeslice(): TimeSlice;
    set timeslice(timeslice: TimeSlice | null | undefined);
    readonly watch: Watchable<typeof NOW>['watch'];
};

export type TimeSlice = WithTimeEdges<number> & {
    readonly offsets: WithTimeEdges<number>;
    readonly span: number;
};

export type TimeSliceFactory = {
    (fromTime?: Time, toTime?: Time): TimeSlice;
    (time?: Time, timeEdge?: TimeFrameRangeEdge): TimeSlice;
};

export type TimeFrameFactory = {
    (size: TimeFrameSize): TimeFrame;
    readonly annual: (size: TimeFrameSize) => TimeFrame;
    readonly cursor: Readonly<{
        BACKWARD: typeof CURSOR_BACKWARD;
        BLOCK_END: typeof CURSOR_BLOCK_END;
        BLOCK_START: typeof CURSOR_BLOCK_START;
        DOWNWARD: typeof CURSOR_DOWNWARD;
        FORWARD: typeof CURSOR_FORWARD;
        LINE_END: typeof CURSOR_LINE_END;
        LINE_START: typeof CURSOR_LINE_START;
        NEXT_BLOCK: typeof CURSOR_NEXT_BLOCK;
        PREV_BLOCK: typeof CURSOR_PREV_BLOCK;
        UPWARD: typeof CURSOR_UPWARD;
    }>;
    readonly flag: Readonly<{
        BLOCK_END: TimeFlag;
        BLOCK_START: TimeFlag;
        CURSOR: TimeFlag;
        LINE_END: TimeFlag;
        LINE_START: TimeFlag;
        RANGE_END: TimeFlag;
        RANGE_START: TimeFlag;
        SELECTION_END: TimeFlag;
        SELECTION_START: TimeFlag;
        TODAY: TimeFlag;
        WEEKEND: TimeFlag;
        WITHIN_BLOCK: TimeFlag;
        WITHIN_RANGE: TimeFlag;
        WITHIN_SELECTION: TimeFlag;
    }>;
    readonly range: TimeSliceFactory &
        Readonly<{
            FROM: typeof RANGE_FROM;
            INFINITE: TimeSlice;
            SINCE_NOW: TimeSlice;
            UNTIL_NOW: TimeSlice;
            TO: typeof RANGE_TO;
        }>;
    readonly selection: Readonly<{
        COLLAPSE: typeof SELECTION_COLLAPSE;
        FARTHEST: typeof SELECTION_FARTHEST;
        FROM: typeof SELECTION_FROM;
        NEAREST: typeof SELECTION_NEAREST;
        TO: typeof SELECTION_TO;
    }>;
    shift: Readonly<{
        BLOCK: typeof SHIFT_BLOCK;
        FRAME: typeof SHIFT_FRAME;
        PERIOD: typeof SHIFT_PERIOD;
    }>;
};
