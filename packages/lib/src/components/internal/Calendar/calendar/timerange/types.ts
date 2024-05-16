import type { Restamper, RestamperWithTimezone } from '../../../../../core/Localization/datetime/restamper';

export type RangeTimestamp = number;
export type RangeTimestampOffsets = readonly [number?, number?, number?, number?, number?, number?, number?];

export type RangeTimestamps<T extends Record<any, any> = {}> = {
    readonly from: RangeTimestamp;
    readonly to: RangeTimestamp;
    get now(): RangeTimestamp;
    set now(timestamp: Date | RangeTimestamp | null);
    get timezone(): RestamperWithTimezone['tz']['current'];
    set timezone(timezone: RestamperWithTimezone['tz']['current'] | null);
} & T;

export type RangeTimestampsConfig = RangeTimestampsConfigWithFromOffsets | RangeTimestampsConfigWithToOffsets | RangeTimestampsConfigWithoutOffsets;

export type RangeTimestampsConfigContext = Readonly<Pick<RangeTimestamps, 'now' | 'timezone'>> & RangeTimestampsConfigRestampingContext;
export type RangeTimestampsConfigParameter<T = {}> = T | ((context: RangeTimestampsConfigContext) => T);
export type RangeTimestampsConfigParameterValue<T> = T extends (context: RangeTimestampsConfigContext) => infer U ? U : T;

export type RangeTimestampsConfigRestampingContext = Readonly<{
    systemToTimezone: (time?: Parameters<Restamper>[0]) => RangeTimestamp;
    timezoneToSystem: (time?: Parameters<Restamper>[0]) => RangeTimestamp;
    timezoneOffset: (time?: Parameters<Restamper>[0]) => number;
}>;

type _RangeTimestampsConfigWithOffsets<K extends keyof RangeTimestampsConfigWithoutOffsets> = Struct<{
    offsets: RangeTimestampsConfigParameter<RangeTimestampOffsets>;
}> &
    Pick<RangeTimestampsConfigWithoutOffsets, K>;

export type RangeTimestampsConfigWithFromOffsets = _RangeTimestampsConfigWithOffsets<'from'>;
export type RangeTimestampsConfigWithToOffsets = _RangeTimestampsConfigWithOffsets<'to'>;

export type RangeTimestampsConfigWithoutOffsets = Struct<{
    from: RangeTimestampsConfigParameter<Date | RangeTimestamps['from']>;
    to: RangeTimestampsConfigParameter<Date | RangeTimestamps['to']>;
}>;

type Struct<T extends Record<any, any> = {}> = T & {
    [key: string | number | symbol]: any;
};
