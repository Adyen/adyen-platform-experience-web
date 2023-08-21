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
import { Indexed } from '../shared/indexed/types';
import { Watchable, WatchCallable } from '../shared/watchable/types';

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

export type TimeSlice = WithTimeEdges<number> & {
    readonly offsets: WithTimeEdges<number>;
    readonly span: number;
};

export type TimeSliceFactory = {
    (fromTime?: Time, toTime?: Time): TimeSlice;
    (time?: Time, timeEdge?: TimeFrameRangeEdge): TimeSlice;
};

export type CalendarConfig = {
    blocks?: TimeFrameSize;
    firstWeekDay?: FirstWeekDay;
    locale?: string;
    minified?: boolean;
    timeslice?: TimeSlice;
    withMinimumHeight?: boolean;
    withRangeSelection?: boolean;
};

export type CalendarBlock = {
    readonly datetime: string;
    readonly label: string;
    readonly month: number;
    readonly year: number;
};

export type CalendarBlockCellData = readonly [string, string, number];
export type CalendarDayOfWeekData = readonly [string, string, string];
export type IndexedCalendarBlock = Indexed<CalendarBlockCellData> & CalendarBlock;

export type CalendarGrid = Indexed<IndexedCalendarBlock> & {
    readonly cursorIndex: number;
    readonly daysOfWeek: Indexed<CalendarDayOfWeekData>;
    // readonly highlight: {
    //     (time: Time, selection?: TimeFrameSelection): void;
    //     readonly clear: () => void;
    //     readonly commit: () => void;
    //     get from(): number | undefined;
    //     set from(time: Time | null | undefined);
    //     get to(): number | undefined;
    //     set to(time: Time | null | undefined);
    // };
    readonly interaction: (evt: Event) => true | undefined;
    readonly rowspan: number;
    readonly shift: (offset?: number, shift?: TimeFrameShift) => void;
};

export type CalendarFactory = {
    (watchCallback?: WatchCallable<any>): {
        readonly configure: (config: CalendarConfig) => void;
        readonly disconnect: () => void;
        readonly grid: CalendarGrid;
    };
    readonly cursor: Readonly<{
        BACKWARD: typeof CURSOR_BACKWARD;
        BLOCK_END: typeof CURSOR_BLOCK_END;
        BLOCK_START: typeof CURSOR_BLOCK_START;
        DOWNWARD: typeof CURSOR_DOWNWARD;
        FORWARD: typeof CURSOR_FORWARD;
        NEXT_BLOCK: typeof CURSOR_NEXT_BLOCK;
        PREV_BLOCK: typeof CURSOR_PREV_BLOCK;
        ROW_END: typeof CURSOR_LINE_END;
        ROW_START: typeof CURSOR_LINE_START;
        UPWARD: typeof CURSOR_UPWARD;
    }>;
    readonly flag: Readonly<{
        BLOCK_END: TimeFlag;
        BLOCK_START: TimeFlag;
        CURSOR: TimeFlag;
        HIGHLIGHTED: TimeFlag;
        HIGHLIGHT_END: TimeFlag;
        HIGHLIGHT_START: TimeFlag;
        RANGE_END: TimeFlag;
        RANGE_START: TimeFlag;
        ROW_END: TimeFlag;
        ROW_START: TimeFlag;
        TODAY: TimeFlag;
        WEEKEND: TimeFlag;
        WITHIN_BLOCK: TimeFlag;
        WITHIN_RANGE: TimeFlag;
    }>;
    readonly highlight: Readonly<{
        COLLAPSE: typeof SELECTION_COLLAPSE;
        FARTHEST: typeof SELECTION_FARTHEST;
        NEAREST: typeof SELECTION_NEAREST;
    }>;
    readonly range: TimeSliceFactory &
        Readonly<{
            FROM: typeof RANGE_FROM;
            SINCE_NOW: TimeSlice;
            TO: typeof RANGE_TO;
            UNBOUNDED: TimeSlice;
            UNTIL_NOW: TimeSlice;
        }>;
    shift: Readonly<{
        BLOCK: typeof SHIFT_BLOCK;
        FRAME: typeof SHIFT_FRAME;
        PERIOD: typeof SHIFT_PERIOD;
    }>;
};
