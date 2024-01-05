import { clamp, hasOwnProperty, isFunction } from '@src/utils/common';
import type {
    RangeTimestamp,
    RangeTimestampsConfig,
    RangeTimestampsConfigContext,
    RangeTimestampsConfigParameter,
    RangeTimestampsConfigParameterValue,
    RangeTimestampsConfigWithFromOffset,
    RangeTimestampsConfigWithoutOffset,
} from './types';

export const getter = <T extends any = any>(get: () => T, enumerable: boolean = true): TypedPropertyDescriptor<T> =>
    ({
        enumerable: (enumerable as any) !== false,
        get,
    } as const);

export const getClampedIntegerValue = <T extends number = number>(minInteger: T, maxInteger: T, value?: T, defaultInteger: T = minInteger) => {
    const normalizedValue = ~~(value as T) === value ? value : defaultInteger;
    return clamp(minInteger, normalizedValue, maxInteger) as T;
};

export const getRangeTimestampsConfigParameterUnwrapper =
    (config: RangeTimestampsConfig, context: RangeTimestampsConfigContext) =>
    <T = {}>(value: T): RangeTimestampsConfigParameterValue<T> =>
        isFunction(value) ? value.call(config, context) : value;

export const isRangeTimestampsConfigWithoutOffset = (config: RangeTimestampsConfig): config is RangeTimestampsConfigWithoutOffset =>
    !hasOwnProperty(config, 'offset');

export const isRangeTimestampsConfigWithFromOffset = (
    config: Exclude<RangeTimestampsConfig, RangeTimestampsConfigWithoutOffset>
): config is RangeTimestampsConfigWithFromOffset => hasOwnProperty(config, 'from');

export const nowTimestamp = (({ now }) => now) satisfies RangeTimestampsConfigParameter<RangeTimestamp>;
export const offsetForNDays = (numberOfDays: number) => Object.freeze([0, 0, numberOfDays, 0, 0, 0, -1] as const);

export const parseRangeTimestamp = (timestamp: RangeTimestamp): RangeTimestamp | undefined => {
    try {
        const normalizedTimestamp = +timestamp === timestamp ? timestamp : undefined;
        const parsedTimestamp = new Date(normalizedTimestamp as RangeTimestamp).getTime();
        return isNaN(parsedTimestamp) ? undefined : parsedTimestamp;
    } catch {
        /* ignore any parsing exception and implicitly return `undefined` */
    }
};

export const startOfDay = (date: Date) => date.setHours(0, 0, 0, 0);

export const startOfMonth = (date: Date) => {
    startOfDay(date);
    return date.setDate(1);
};

export const startOfYear = (date: Date) => {
    startOfDay(date);
    return date.setMonth(0, 1);
};
