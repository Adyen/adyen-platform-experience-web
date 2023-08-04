import {
    CURSOR_BACKWARD,
    CURSOR_BACKWARD_EDGE,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_FORWARD_EDGE,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
    SIZES,
    SIZE_1,
    SIZE_12,
    SIZE_2,
    SIZE_3,
    SIZE_4,
    SIZE_6,
} from './constants';
import { Month } from '../shared/types';
import { Watchable } from '../shared/watchable/types';
import { TimeOrigin } from '../timeorigin/types';
import { TimeSelection } from '../timeselection/types';

export type TimeFrameCursorShift =
    | typeof CURSOR_BACKWARD
    | typeof CURSOR_BACKWARD_EDGE
    | typeof CURSOR_BLOCK_END
    | typeof CURSOR_BLOCK_START
    | typeof CURSOR_DOWNWARD
    | typeof CURSOR_FORWARD
    | typeof CURSOR_FORWARD_EDGE
    | typeof CURSOR_NEXT_BLOCK
    | typeof CURSOR_PREV_BLOCK
    | typeof CURSOR_UPWARD;

export type TimeFrameShift = typeof SHIFT_BLOCK | typeof SHIFT_FRAME | typeof SHIFT_PERIOD;
export type TimeFrameBlockSize = (typeof SIZES)[number];
export type TimeFrameSize = typeof SIZE_1 | typeof SIZE_2 | typeof SIZE_3 | typeof SIZE_4 | typeof SIZE_6 | typeof SIZE_12 | TimeFrameBlockSize;

export type WithTimeFrameCursor = {
    get cursor(): number;
    set cursor(shift: TimeFrameCursorShift | number);
};

export type TimeFrameAtoms = {
    days: number;
    length: TimeFrameBlockSize;
    originTimestamp: number;
    todayTimestamp: number;
};

export type TimeFrame = {
    [K: number]: TimeFrameMonth;
    readonly days: number;
    get length(): TimeFrameBlockSize;
    set length(length: TimeFrameSize | null | undefined);
    readonly shift: (offset?: number, shift?: TimeFrameShift) => void;
};

export type TimeFrameMonth = {
    readonly [K: number]: number;
    readonly flags: { readonly [K: number]: number };
    readonly index: number;
    readonly length: number;
    readonly month: Month;
    readonly year: number;
};

export type TimeFrameMonthMetrics = [Month, number, number, number, number];

export type TimeFrameFactory = {
    (length?: TimeFrameSize): TimeFrame &
        WithTimeFrameCursor & {
            firstWeekDay: TimeOrigin['firstWeekDay'];
            origin: TimeOrigin['time'];
            readonly select: TimeSelection['select'];
            readonly selection: {
                from: TimeSelection['from'];
                to: TimeSelection['to'];
            };
            timeslice: TimeOrigin['timeslice'];
            readonly watch: Watchable<TimeFrameAtoms>['watch'];
        };
    readonly CURSOR_BACKWARD: typeof CURSOR_BACKWARD;
    readonly CURSOR_BACKWARD_EDGE: typeof CURSOR_BACKWARD_EDGE;
    readonly CURSOR_BLOCK_END: typeof CURSOR_BLOCK_END;
    readonly CURSOR_BLOCK_START: typeof CURSOR_BLOCK_START;
    readonly CURSOR_DOWNWARD: typeof CURSOR_DOWNWARD;
    readonly CURSOR_FORWARD: typeof CURSOR_FORWARD;
    readonly CURSOR_FORWARD_EDGE: typeof CURSOR_FORWARD_EDGE;
    readonly CURSOR_NEXT_BLOCK: typeof CURSOR_NEXT_BLOCK;
    readonly CURSOR_PREV_BLOCK: typeof CURSOR_PREV_BLOCK;
    readonly CURSOR_UPWARD: typeof CURSOR_UPWARD;
    readonly SHIFT_BLOCK: typeof SHIFT_BLOCK;
    readonly SHIFT_FRAME: typeof SHIFT_FRAME;
    readonly SHIFT_PERIOD: typeof SHIFT_PERIOD;
    readonly SIZE_1: typeof SIZE_1;
    readonly SIZE_2: typeof SIZE_2;
    readonly SIZE_3: typeof SIZE_3;
    readonly SIZE_4: typeof SIZE_4;
    readonly SIZE_6: typeof SIZE_6;
    readonly SIZE_12: typeof SIZE_12;
};
