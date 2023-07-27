export type Time = Date | number | string;
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Month = WeekDay | 7 | 8 | 9 | 10 | 11;

export const enum TimeFlag {
    WEEK_START = 0x1,
    WEEK_END = 0x2,
    WEEKEND = 0x4,
    TODAY = 0x8,
    MONTH_START = 0x10,
    MONTH_END = 0x20,
    WITHIN_MONTH = 0x40,
    CURSOR = 0x80,
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

export type WithTimeEdges<T = {}> = {
    readonly from: T;
    readonly to: T;
};
