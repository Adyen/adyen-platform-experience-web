export type RangeTimestamp = number;
export type RangeTimestampOffset = readonly [number?, number?, number?, number?, number?, number?, number?];
export type RangeConstraintSource<T = {}> = T | ((...args: any[]) => T);

export type TimeRange = {
    (): void;
    readonly from: RangeTimestamp;
    readonly now: RangeTimestamp;
    readonly to: RangeTimestamp;
};

export type RangeTimestamps = Struct<{
    from: RangeConstraintSource<TimeRange['from']>;
    to: RangeConstraintSource<TimeRange['to']>;
}>;

type RangeTimestampWithOffset<K extends keyof RangeTimestamps> = Struct<{
    offset: RangeConstraintSource<RangeTimestampOffset>;
}> &
    Pick<RangeTimestamps, K>;

export type RangeFromTimestampWithOffset = RangeTimestampWithOffset<'from'>;
export type RangeToTimestampWithOffset = RangeTimestampWithOffset<'to'>;
export type RangeTimestampConfig = RangeTimestamps | RangeFromTimestampWithOffset | RangeToTimestampWithOffset;

type Struct<T extends Record<any, any> = {}> = T & {
    [key: string | number | symbol]: any;
};

export type UnwrappedRangeConstraintSource<T> = T extends (...args: any[]) => infer U ? U : T;
