export type RangeTimestamp = number;
export type RangeTimestampOffset = readonly [number?, number?, number?, number?, number?, number?, number?];

export type RangeTimestamps<T extends Record<any, any> = {}> = {
    readonly from: RangeTimestamp;
    readonly to: RangeTimestamp;
    get now(): RangeTimestamp;
    set now(timestamp: RangeTimestamp | null);
} & T;

export type RangeTimestampsConfig = RangeTimestampsConfigWithFromOffset | RangeTimestampsConfigWithToOffset | RangeTimestampsConfigWithoutOffset;

export type RangeTimestampsConfigContext = Pick<RangeTimestamps, 'now'>;
export type RangeTimestampsConfigParameter<T = {}> = T | ((context: RangeTimestampsConfigContext) => T);
export type RangeTimestampsConfigParameterValue<T> = T extends (context: RangeTimestampsConfigContext) => infer U ? U : T;

type _RangeTimestampsConfigWithOffset<K extends keyof RangeTimestampsConfigWithoutOffset> = Struct<{
    offset: RangeTimestampsConfigParameter<RangeTimestampOffset>;
}> &
    Pick<RangeTimestampsConfigWithoutOffset, K>;

export type RangeTimestampsConfigWithFromOffset = _RangeTimestampsConfigWithOffset<'from'>;
export type RangeTimestampsConfigWithToOffset = _RangeTimestampsConfigWithOffset<'to'>;

export type RangeTimestampsConfigWithoutOffset = Struct<{
    from: RangeTimestampsConfigParameter<RangeTimestamps['from']>;
    to: RangeTimestampsConfigParameter<RangeTimestamps['to']>;
}>;

type Struct<T extends Record<any, any> = {}> = T & {
    [key: string | number | symbol]: any;
};
