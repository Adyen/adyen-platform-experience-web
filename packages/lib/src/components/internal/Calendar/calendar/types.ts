import {
    CONTROLS_ALL,
    CONTROLS_MINIMAL,
    CONTROLS_NONE,
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
    DAY_OF_WEEK_FORMATS,
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
import { Indexed } from './shared/indexed/types';
import { Watchable, WatchCallable } from './shared/watchable/types';
import { TimeFrame } from '@src/components/internal/Calendar/calendar/internal/timeframe';

export type WithGetSetProperty<T> = {
    get _(): T;
    set _($: T);
};

// export type WithGetSetProperties<K extends string, T = any> = {
//     [P in K]: WithGetSetProperty<T>['_'];
// };

export type WithTimeEdges<T = {}> = Readonly<{
    from: T;
    to: T;
}>;

export type Today = Readonly<{
    timestamp: number;
    watch: Watchable<{}>['watch'];
}>;

export type DayOfWeekLabelFormat = (typeof DAY_OF_WEEK_FORMATS)[number];
export type FirstWeekDay = (typeof FIRST_WEEK_DAYS)[number];
export type WeekDay = FirstWeekDay | 2 | 3 | 4 | 5;
export type Month = WeekDay | 7 | 8 | 9 | 10 | 11;
export type MonthDays = 28 | 29 | 30 | 31;
export type Time = Date | number | string;

export enum TimeFlag {
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
    ALL = 0x3fff,
}

export type TimeFlagProp = Exclude<keyof typeof TimeFlag, 'ALL'>;

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

export type TimeFrameBlock = TimeFrameBlockMetrics<'inner' | 'outer'> &
    Readonly<{
        [K: number]: readonly [number, number];
        month: Month;
        year: number;
    }>;

export type TimeSlice = WithTimeEdges<number> &
    Readonly<{
        offsets: WithTimeEdges<number>;
        span: number;
    }>;

export type TimeSliceFactory = {
    (fromTime?: Time, toTime?: Time): TimeSlice;
    (time?: Time, timeEdge?: TimeFrameRangeEdge): TimeSlice;
};

export const enum CalendarShiftControlFlag {
    PREV = 0x1,
    BLOCK = 0x0,
    FRAME = 0x2,
    PERIOD = 0x4,
}

export enum CalendarShiftControlsFlag {
    PREV_PERIOD = CalendarShiftControlFlag.PREV | CalendarShiftControlFlag.PERIOD,
    PREV_FRAME = CalendarShiftControlFlag.PREV | CalendarShiftControlFlag.FRAME,
    PREV = CalendarShiftControlFlag.PREV | CalendarShiftControlFlag.BLOCK,
    NEXT = CalendarShiftControlFlag.BLOCK,
    NEXT_FRAME = CalendarShiftControlFlag.FRAME,
    NEXT_PERIOD = CalendarShiftControlFlag.PERIOD,
}

export type CalendarShiftControl = keyof typeof CalendarShiftControlsFlag;
export type CalendarShiftControls = typeof CONTROLS_ALL | typeof CONTROLS_MINIMAL | typeof CONTROLS_NONE;

export type CalendarConfig = {
    blocks?: TimeFrameSize;
    controls?: CalendarShiftControls;
    firstWeekDay?: FirstWeekDay;
    locale?: string;
    minified?: boolean;
    timeslice?: TimeSlice;
    withMinimumHeight?: boolean;
    withRangeSelection?: boolean;
};

export type CalendarBlock = Readonly<{
    datetime: string;
    label: string;
    month: number;
    year: number;
}>;

export type CalendarFlagsRecord = Readonly<{
    [K in TimeFlagProp]?: 1;
}>;

export type CalendarBlockCellData = Readonly<{
    datetime: string;
    flags: CalendarFlagsRecord;
    index: number;
    label: string;
    timestamp: number;
}>;

export type CalendarDayOfWeekData = Readonly<{
    flags: CalendarFlagsRecord;
    labels: Readonly<{ [K in DayOfWeekLabelFormat]: string }>;
}>;

export type IndexedCalendarBlock = Indexed<Indexed<CalendarBlockCellData>> & CalendarBlock;

export type CalendarConfigurator = Readonly<{
    cleanup: () => void;
    config: CalendarConfig;
    configure: CalendarGrid['config'];
    frame?: TimeFrame;
}>;

export type CalendarHighlighter = Readonly<{
    highlight: {
        (): void;
        readonly blank: boolean;
    };
}>;

export type CalendarGridControls = Readonly<{
    [P in CalendarShiftControl]?: (evt?: Event) => boolean;
}>;

export type CalendarGridControlEntry = [CalendarShiftControl, Exclude<CalendarGridControls[CalendarShiftControl], undefined>];

export type CalendarGrid = Indexed<IndexedCalendarBlock> &
    Readonly<{
        config: {
            (config?: CalendarConfig): CalendarConfig;
            cursorIndex: WithGetSetProperty<(this: CalendarConfig, evt: Event) => number | undefined>['_'];
            shiftFactor: WithGetSetProperty<(this: CalendarConfig, evt: Event, target: CalendarShiftControl) => number | undefined>['_'];
            watch: WithGetSetProperty<WatchCallable<any, CalendarConfig>>['_'];
        };
        controls: Indexed<CalendarGridControlEntry> & CalendarGridControls;
        cursor: (evt?: Event) => boolean;
        daysOfWeek: Indexed<CalendarDayOfWeekData>;
        // highlight: {
        //     (time: Time, selection?: TimeFrameSelection): void;
        //     readonly clear: () => void;
        //     readonly commit: () => void;
        //     get from(): number | undefined;
        //     set from(time: Time | null | undefined);
        //     get to(): number | undefined;
        //     set to(time: Time | null | undefined);
        // };
    }>;

export type CalendarInit = CalendarConfig | TimeFrameSize | WatchCallable<any, CalendarConfig>;

export type CalendarFactory = {
    (init: CalendarInit): Readonly<{
        grid: CalendarGrid;
        kill: () => void;
    }>;
    readonly controls: Readonly<{
        ALL: typeof CONTROLS_ALL;
        MINIMAL: typeof CONTROLS_MINIMAL;
        NONE: typeof CONTROLS_NONE;
    }>;
    readonly range: TimeSliceFactory &
        Readonly<{
            FROM: typeof RANGE_FROM;
            SINCE_NOW: TimeSlice;
            TO: typeof RANGE_TO;
            UNBOUNDED: TimeSlice;
            UNTIL_NOW: TimeSlice;
        }>;
};
