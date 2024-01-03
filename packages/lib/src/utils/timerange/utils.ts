import { hasOwnProperty, isFunction } from '@src/utils/common';
import type { RangeFromTimestampWithOffset, RangeTimestamp, RangeTimestampConfig, RangeTimestamps, UnwrappedRangeConstraintSource } from './types';

export const getRangeConfigUnwrapper =
    (config: RangeTimestampConfig) =>
    <T = {}>(value: T): UnwrappedRangeConstraintSource<T> =>
        isFunction(value) ? value.call(config) : value;

export const isRangeTimestamps = (config: RangeTimestampConfig): config is RangeTimestamps => !hasOwnProperty(config, 'offset');

export const isRangeFromTimestampWithOffset = (config: Exclude<RangeTimestampConfig, RangeTimestamps>): config is RangeFromTimestampWithOffset =>
    hasOwnProperty(config, 'from');

export const parseTimestamp = (timestamp: RangeTimestamp) => {
    const parsedTimestamp = new Date(timestamp).getTime();
    return isNaN(parsedTimestamp) ? undefined : parsedTimestamp;
};

export const startOfDay = (date: Date) => date.setHours(0, 0, 0, 0);
export const startOfMonth = (date: Date) => date.setDate(1);
export const startOfYear = (date: Date) => date.setMonth(0, 1);
