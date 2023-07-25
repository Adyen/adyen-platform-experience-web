export const SHIFT_FRAME: unique symbol = Symbol();
export const SHIFT_MONTH: unique symbol = Symbol();
export const SHIFT_YEAR: unique symbol = Symbol();

export type Time = Date | number | string;
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Month = WeekDay | 7 | 8 | 9 | 10 | 11;

export type TimeShift = typeof SHIFT_FRAME | typeof SHIFT_MONTH | typeof SHIFT_YEAR;

export type WithTimeEdges<T = {}> = {
    readonly from: T;
    readonly to: T;
};
