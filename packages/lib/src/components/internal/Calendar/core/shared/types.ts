export type Time = Date | number | string;
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Month = WeekDay | 7 | 8 | 9 | 10 | 11;

export type WithTimeEdges<T = {}> = {
    readonly from: T;
    readonly to: T;
};
