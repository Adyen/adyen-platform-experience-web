import type { RestampContext } from './types';

export const REGEX_TZ_OFFSET = /(?<=GMT)(?:[-+](?:0?\d|1[0-4])(?::?[0-5]\d)?)?$/;

export const { BASE_FORMAT_OPTIONS, BASE_LOCALE, SYSTEM_TIMEZONE, SYSTEM_TIMEZONE_FORMATTER } = (() => {
    const BASE_LOCALE = 'en-US';
    const DIGITS_2 = '2-digit';
    const NUMERIC = 'numeric';
    const SHORT = 'short';
    const TZ_LONG = 'longOffset';
    const FRACTIONAL_SECOND_DIGITS = 3;

    const BASE_FORMAT_OPTIONS: Readonly<Intl.DateTimeFormatOptions> = Object.freeze({
        year: NUMERIC,
        month: SHORT,
        day: NUMERIC,
        hour: DIGITS_2,
        minute: DIGITS_2,
        second: DIGITS_2,
        fractionalSecondDigits: FRACTIONAL_SECOND_DIGITS,
        timeZoneName: TZ_LONG, // should not be changed — needed for the tz offsets regexp
    });

    let SYSTEM_TIMEZONE: RestampContext['TIMEZONE'];
    let SYSTEM_TIMEZONE_FORMATTER: RestampContext['formatter'];

    try {
        SYSTEM_TIMEZONE_FORMATTER = new Intl.DateTimeFormat(BASE_LOCALE, BASE_FORMAT_OPTIONS);
        SYSTEM_TIMEZONE = SYSTEM_TIMEZONE_FORMATTER.resolvedOptions().timeZone;
    } catch (ex) {
        SYSTEM_TIMEZONE = undefined;
    }

    return { BASE_FORMAT_OPTIONS, BASE_LOCALE, SYSTEM_TIMEZONE, SYSTEM_TIMEZONE_FORMATTER };
})();
