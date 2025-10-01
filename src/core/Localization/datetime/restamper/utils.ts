import { EMPTY_ARRAY, mod } from '../../../../utils';
import { REGEX_TZ_OFFSET, SYSTEM_TIMEZONE_FORMATTER } from './constants';
import type { RestampContext, Restamper, RestampResult } from './types';

const REGEX_GMT_OFFSET_UNWANTED_SUBSTRINGS = /\+(?=-)|([+-]00:00)/g;
const REGEX_TZ_SINGLE_DIGIT_OFFSET = /(^\D?)(\d)$/;

export const computeTimezoneOffsetInMinutes = ([offsetHours, offsetMinutes]: readonly [number, number]) =>
    (Math.abs(offsetHours * 60) + offsetMinutes) * (offsetHours < 0 ? -1 : 1);

export const computeTimezoneOffsetsFromMinutes = (timezoneOffsetInMinutes: number) =>
    Object.freeze([
        Math.floor(timezoneOffsetInMinutes / 60), // offset hours
        mod(timezoneOffsetInMinutes, 60), // offset minutes
    ] as const);

export const parseTimezoneOffset = (offset: string | number) => parseInt(offset as string, 10) || 0;

/**
 * @param timezoneOffset {number} The minute offsets relative to GMT (Greenwich Mean Time).
 * @returns {string} The GMT suffixed string for the specified offsets in the format GMT(+|-)[HH]:[MM], or just GMT (if [HH]:[MM] is 00:00).
 */
export const getGMTSuffixForTimezoneOffset = (timezoneOffset: RestampResult['offset']): string => {
    const offsets = computeTimezoneOffsetsFromMinutes(timezoneOffset);
    const offsetString = offsets.map(offset => `${offset}`.replace(REGEX_TZ_SINGLE_DIGIT_OFFSET, '$10$2')).join(':');
    return `GMT+${offsetString}`.replace(REGEX_GMT_OFFSET_UNWANTED_SUBSTRINGS, '');
};

/**
 * @param timezoneOffset {number} The minute offsets of the timezone relative to GMT (Greenwich Mean Time).
 * @param timezoneOffsetRelativeToSystem {number} The minute offsets of the timezone relative to the system timezone.
 * @returns {string} The system timezone GMT suffixed string in the format GMT(+|-)[HH]:[MM], or just GMT (if [HH]:[MM] is 00:00).
 */
export const getSystemTimezoneGMTSuffixFromTimezoneOffsets = (
    timezoneOffset: RestampResult['offset'],
    timezoneOffsetRelativeToSystem: RestampResult['offset']
): string => getGMTSuffixForTimezoneOffset(timezoneOffset - timezoneOffsetRelativeToSystem);

export const getTimezoneOffsetFromFormattedDateString = (date?: string): number => {
    const offsets = date?.match(REGEX_TZ_OFFSET)?.[0].replace('GMT', '').split(':', 2).map(parseTimezoneOffset) ?? (EMPTY_ARRAY as readonly number[]);
    return computeTimezoneOffsetInMinutes(offsets.concat(0, 0).slice(0, 2) as [number, number]);
};

export const getTimezoneOffsetForTimestamp = (timestamp: number, timezoneFormatter: RestampContext['formatter'] = SYSTEM_TIMEZONE_FORMATTER) => {
    const date = new Date(timestamp);
    const systemOffset = getTimezoneOffsetFromFormattedDateString(SYSTEM_TIMEZONE_FORMATTER?.format(date));
    const timezoneOffset = getTimezoneOffsetFromFormattedDateString(timezoneFormatter?.format(date));
    return timezoneOffset - systemOffset;
};

const restamp = <R extends Restamper = Restamper>(restamper: R, time: Parameters<R>[0], direction: -1 | 1 = 1) => {
    const { offset, timestamp } = restamper(time);
    return timestamp - offset * direction * 60000;
};

export const systemToTimezone = <R extends Restamper = Restamper>(restamper: R, time: Parameters<R>[0]) => restamp(restamper, time, 1);
export const timezoneToSystem = <R extends Restamper = Restamper>(restamper: R, time: Parameters<R>[0]) => restamp(restamper, time, -1);
