import { zoneFrom } from './index';
import { EMPTY_ARRAY, parseDate } from '../../../utils';
import type { DateValue } from '../../../utils/datetime/types';
import type { TimezoneDataSource } from '../types';

const LOCALE = 'en-US';
const TZ_OFFSET_REGEXP = /(?<=GMT)(?:([-+](?:\d(?=:|$)|[01]\d|2[0-3]))(?::(?!$))?(?=([0-5]\d$)?)\2)?$/;

const _getDateTimeFormatOptions = (() => {
    let tz: string | undefined;
    const DIGITS_2 = '2-digit';
    const FORMAT_OPTIONS: Readonly<Intl.DateTimeFormatOptions> = Object.freeze({
        weekday: 'short',
        year: 'numeric',
        month: DIGITS_2,
        day: DIGITS_2,
        hour: DIGITS_2,
        minute: DIGITS_2,
        second: DIGITS_2,
        fractionalSecondDigits: 3,
        hour12: false,
        timeZoneName: 'longOffset',
        // prettier-ignore
        get timeZone() { return tz },
    });

    return (timezone?: string) => {
        tz = timezone;
        return FORMAT_OPTIONS;
    };
})();

export const dateFrom = (date: DateValue) => new Date(parseDate(date)!);
export const getResolvedTimezone = (timezone?: string) => getTimezoneFormatter(timezone).resolvedOptions().timeZone;
export const getTimezoneFormatter = (timezone?: string) => new Intl.DateTimeFormat(LOCALE, _getDateTimeFormatOptions(timezone));

export function getTimezoneUTCOffset(this: TimezoneDataSource, date: Date) {
    const [offsetHrs = '', offsetMins = ''] = matchTimezoneFormattedString.call(this, TZ_OFFSET_REGEXP, date);
    return -offsetHrs * 60 + -offsetMins * (+offsetHrs < 0 ? -1 : 1);
}

export function matchTimezoneFormattedString(this: TimezoneDataSource, regex: RegExp, date: Date) {
    return (zoneFrom(this).formatter.format(date).match(regex) ?? EMPTY_ARRAY).slice(1);
}

export function restamp(this: TimezoneDataSource, date: DateValue, direction: -1 | 1) {
    const timestamp = dateFrom(date).getTime();
    const timezoneOffsetMinutes = zoneFrom(this).offsets(timestamp)[1];
    return timestamp + timezoneOffsetMinutes * direction * 60000;
}
