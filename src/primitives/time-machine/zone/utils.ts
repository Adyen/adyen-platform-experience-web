import { zoneFrom } from './main';
import { EMPTY_ARRAY, parseDate } from '../../../utils';
import type { DateValue } from '../../../utils/datetime/types';
import type { RecordWithTimezone } from '../types';

const LOCALE = 'en-US';
const DIGITS_2 = '2-digit';
const TZ_OFFSET_REGEXP = /(?<=GMT)(?:([-+](?:0?\d|1[0-4]))(?::?([0-5]\d))?)?$/;

const DATE_TIME_FORMAT_OPTIONS: Readonly<Intl.DateTimeFormatOptions> = Object.freeze({
    year: 'numeric',
    month: DIGITS_2,
    day: DIGITS_2,
    hour: DIGITS_2,
    minute: DIGITS_2,
    second: DIGITS_2,
    fractionalSecondDigits: 3,
    hour12: false,
    timeZoneName: 'longOffset', // do not change (required for `TZ_OFFSET_REGEXP`)
});

export const dateFrom = (date: DateValue) => new Date(parseDate(date)!);
export const getResolvedTimezone = (timezone?: string) => getTimezoneFormatter(timezone).resolvedOptions().timeZone;
export const getTimezoneFormatter = (timeZone?: string) => new Intl.DateTimeFormat(LOCALE, { ...DATE_TIME_FORMAT_OPTIONS, timeZone });

export function getTimezoneUTCOffset(this: RecordWithTimezone, date: Date) {
    const [offsetHrs = '', offsetMins = ''] = matchTimezoneFormattedString.call(this, TZ_OFFSET_REGEXP, date);
    return -offsetHrs * 60 + -offsetMins * (+offsetHrs < 0 ? -1 : 1);
}

export function matchTimezoneFormattedString(this: RecordWithTimezone, regex: RegExp, date: Date) {
    return (zoneFrom(this).defaultFormatter.format(date).match(regex) ?? EMPTY_ARRAY).slice(1);
}

export function restamp(this: RecordWithTimezone, date: DateValue, direction: -1 | 1) {
    const time = dateFrom(date);
    return time.setMinutes(time.getMinutes() + zoneFrom(this).timezoneOffsets(time)[1] * direction);
}
