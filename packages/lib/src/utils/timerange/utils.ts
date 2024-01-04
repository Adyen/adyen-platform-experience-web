import { hasOwnProperty, isFunction } from '@src/utils/common';
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

export const parseRangeTimestamp = (timestamp: RangeTimestamp) => {
    const parsedTimestamp = new Date(timestamp).getTime();
    return isNaN(parsedTimestamp) ? undefined : parsedTimestamp;
};

export const startOfDay = (date: Date) => date.setHours(0, 0, 0, 0);
export const startOfMonth = (date: Date) => date.setDate(1);
export const startOfYear = (date: Date) => date.setMonth(0, 1);
