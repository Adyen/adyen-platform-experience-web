import restamper, { systemToTimezone, timezoneToSystem } from '../../../../core/Localization/datetime/restamper';
import { BASE_LOCALE } from '../../../../core/Localization/datetime/restamper/constants';
import { DEFAULT_DATETIME_FORMAT } from '../../../../core/Localization/constants/localization';
import { EMPTY_ARRAY, EMPTY_OBJECT, isInfinity, isUndefined, mod } from '../../../../utils';
import type { Month, MonthDays, Time, WeekDay } from './types';

const DATE_PARTS_REGEX = /^(\d{2})\/(\d{2})\/(-?\d+)$/;

const _startTimestamp = (() => {
    type DayStartParams = ['getDate', 'setDate'];
    type MonthStartParams = ['getMonth', 'setMonth', (date: Date) => number];
    type YearStartParams = ['getFullYear', 'setFullYear', (date: Date) => number];

    return (...args: DayStartParams | MonthStartParams | YearStartParams) => {
        const [dateGetter, dateSetter, startTimestamp] = args;

        return (timestamp: Date | number, timezone?: string) => {
            const date = new Date(timestamp);
            const restamper = withTimezone(timezone);
            const restampedDate = new Date(timezoneToSystem(restamper, timestamp));

            let diff = (date[dateGetter]() - restampedDate[dateGetter]()) as -1 | 1 | 0;

            if (diff) {
                // Diff correction for either of these cases:
                // - between first (1) and last (28, 29, 30, 31) days of neighbouring months
                // - between first (0) and last (11) months of neighbouring years
                diff = diff > 1 ? -1 : diff < -1 ? 1 : diff;
            }

            // first get to start of timestamp day
            date.setHours(0, 0, 0, 0);

            startTimestamp?.(date);
            date[dateSetter](date[dateGetter]() - diff);
            return systemToTimezone(restamper, date);
        };
    };
})();

export const startOfWeek = (timestamp: Date | number, timezone?: string, firstWeekDay?: WeekDay) => {
    const date = new Date(timestamp);
    const restamper = withTimezone(timezone);
    const restampedDate = new Date(timezoneToSystem(restamper, timestamp));
    const dayDiff = (date.getDay() - restampedDate.getDay()) as -1 | 1 | 0;

    date.setHours(0, 0, 0, 0);

    if (dayDiff) {
        // Correction for difference between first (0) and last (6) days of neighbouring weeks
        const dateDiff = dayDiff > 1 ? -1 : dayDiff < -1 ? 1 : dayDiff;
        date.setDate(date.getDate() - dateDiff);
    }

    const weekDay = date.getDay() as WeekDay;
    const dateOffset = (((-weekDay % 7) + ((firstWeekDay ?? 0) - 7)) % 7) as 0 | -1 | -2 | -3 | -4 | -5 | -6;

    date.setDate(date.getDate() + dateOffset);
    return systemToTimezone(restamper, date);
};

export const startOfDay = _startTimestamp('getDate', 'setDate');
export const startOfMonth = _startTimestamp('getMonth', 'setMonth', date => date.setDate(1));
export const startOfYear = _startTimestamp('getFullYear', 'setFullYear', date => date.setMonth(0, 1));

export const isLeapYear = (year: number) => (year % 100 ? year % 4 : year % 400) === 0;

export const getMonthDays = (month: Month, year: number, offset = 0) => {
    const nextMonth = month + offset;
    const monthIndex = mod(nextMonth, 12) as Month;
    const nextYear = year + Math.floor(nextMonth / 12);

    let days: MonthDays = 31;

    switch (monthIndex) {
        case 1:
            days = isLeapYear(nextYear) ? 29 : 28;
            break;
        case 3:
        case 5:
        case 8:
        case 10:
            days = 30;
            break;
    }

    return [days, monthIndex, nextYear] as const;
};

export const computeTimestampOffset = (timestamp: number, timezone?: string) =>
    isInfinity(timestamp) ? 0 : timestamp - startOfDay(timestamp, timezone);

export const getDateObjectFromTimestamp = (timestamp?: number) => (isUndefined(timestamp) ? timestamp : new Date(timestamp));

export const getTimezoneDateString = (date: number | string | Date, options: Intl.DateTimeFormatOptions = EMPTY_OBJECT) => {
    const restamper = withTimezone(options.timeZone);
    const dateOptions = { ...DEFAULT_DATETIME_FORMAT, ...options, timeZone: restamper.tz.current };
    return new Date(date).toLocaleDateString(BASE_LOCALE, dateOptions);
};

export const getTimezoneDateParts = (date: number | string | Date, timeZone?: string) => {
    const [, month = '', day = '', year = ''] = getTimezoneDateString(date, { timeZone }).match(DATE_PARTS_REGEX) ?? EMPTY_ARRAY;
    return [+year, +month - 1, +day] as const;
};

export const getEdgesDistance = (fromTime: Time, toTime: Time, timezone?: string) => {
    if (isInfinity(fromTime) || isInfinity(toTime)) return Infinity;
    const [fromYear, fromMonth] = getTimezoneDateParts(fromTime, timezone);
    const [toYear, toMonth] = getTimezoneDateParts(toTime, timezone);
    return Math.abs(toMonth - fromMonth + (toYear - fromYear) * 12);
};

export const withTimezone = (() => {
    const _restamper = restamper();
    return (timezone?: string) => {
        _restamper.tz = undefined; // first reset to system timezone
        _restamper.tz = timezone;
        return _restamper;
    };
})();
